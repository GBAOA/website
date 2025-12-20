'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface NetworkRequest {
    url: string;
    method: string;
    type: string;
    status?: number;
    hasResponse: boolean;
}

interface LoginResult {
    cookies: Array<{
        name: string;
        value: string;
        domain: string;
        path: string;
        httpOnly: boolean;
        secure: boolean;
    }>;
    headers: Record<string, string>;
    endpoints: {
        ajax: string[];
        api: string[];
        other: string[];
    };
    tokens: Record<string, string>;
    networkRequestsCount: number;
    sampleRequests: NetworkRequest[];
    lastUpdated: string;
}

export default function AddaLoginPage() {
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginResult, setLoginResult] = useState<LoginResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
    const [fetchingData, setFetchingData] = useState(false);
    const [fetchedData, setFetchedData] = useState<Record<string, any> | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loginStatus, setLoginStatus] = useState<'idle' | 'waiting' | 'logged_in' | 'failed'>('idle');
    const [showIframe, setShowIframe] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, []);

    const handleLogin = async () => {
        setIsLoggingIn(true);
        setError(null);
        setLoginResult(null);
        setFetchedData(null);
        setLoginStatus('waiting');

        try {
            // Start interactive login session
            const res = await fetch('/api/adda/interactive-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start' })
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to start login session');
            }

            setSessionId(data.sessionId);
            setShowIframe(true);

            // Start polling for login status
            let checkCount = 0;
            checkIntervalRef.current = setInterval(async () => {
                checkCount++;
                try {
                    const checkRes = await fetch('/api/adda/interactive-login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'check', sessionId: data.sessionId })
                    });

                    const checkData = await checkRes.json();

                    if (checkData.status === 'logged_in') {
                        // Login successful!
                        if (checkIntervalRef.current) {
                            clearInterval(checkIntervalRef.current);
                            checkIntervalRef.current = null;
                        }

                        setLoginStatus('logged_in');
                        setShowIframe(false);
                        setIsLoggingIn(false);

                        setLoginResult(checkData.data);
                        setStatusMessage('Login successful! Cookies and tokens captured.');
                        
                        // Auto-select common endpoints
                        const allEndpoints = [
                            ...(checkData.data.endpoints?.ajax || []),
                            ...(checkData.data.endpoints?.api || [])
                        ];
                        setSelectedEndpoints(allEndpoints.filter((e: string) => 
                            e.includes('ajax_fetch_apt_flats') || 
                            e.includes('ajax_admin_residents') ||
                            (e.includes('ajax') && e.includes('.php'))
                        ));
                    } else if (checkData.status === 'failed') {
                        // Only stop on actual failure (browser closed by user, etc.)
                        // Don't stop on timeout - keep checking
                        if (checkData.error && checkData.error.includes('disconnected')) {
                            if (checkIntervalRef.current) {
                                clearInterval(checkIntervalRef.current);
                                checkIntervalRef.current = null;
                            }
                            setLoginStatus('failed');
                            setShowIframe(false);
                            setIsLoggingIn(false);
                            setError(checkData.error || 'Browser was closed');
                            setStatusMessage('');
                        } else {
                            // Minor error, keep checking
                            setStatusMessage(`Checking... (attempt ${checkCount}) - ${checkData.error || 'Waiting for login'}`);
                            console.log('Login check status:', checkData.status, checkData.error);
                        }
                    } else if (checkData.status === 'timeout') {
                        // Timeout doesn't mean failure - user might still be logging in
                        // Show warning but keep checking
                        setStatusMessage(`Still waiting for login... (${checkCount} checks) - Please complete login in the browser window`);
                        setError('Login is taking longer than expected. Please continue in the browser window.');
                        console.log('Login timeout warning, but continuing to check...');
                    } else if (checkData.status === 'waiting') {
                        setStatusMessage(`Waiting for login... (checking ${checkCount})`);
                    }
                } catch (err: any) {
                    console.error('Error checking login status:', err);
                    // Don't stop polling on network errors - might be temporary
                }
            }, 3000); // Check every 3 seconds (less frequent to reduce load)

        } catch (err: any) {
            setError(err.message || 'Failed to start login to Adda.io');
            setLoginStatus('failed');
            setIsLoggingIn(false);
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
            }
        }
    };

    const handleCancelLogin = async () => {
        if (sessionId && checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
        }

        if (sessionId) {
            try {
                await fetch('/api/adda/interactive-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'cancel', sessionId })
                });
            } catch (e) {
                console.error('Error cancelling session:', e);
            }
        }

        setSessionId(null);
        setShowIframe(false);
        setLoginStatus('idle');
        setIsLoggingIn(false);
    };

    const handleFetchData = async () => {
        if (selectedEndpoints.length === 0) {
            setError('Please select at least one endpoint');
            return;
        }

        setFetchingData(true);
        setError(null);

        try {
            const res = await fetch('/api/adda/fetch-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoints: selectedEndpoints })
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch data');
            }

            setFetchedData(data.data);

        } catch (err: any) {
            setError(err.message || 'Failed to fetch data from endpoints');
        } finally {
            setFetchingData(false);
        }
    };

    const toggleEndpoint = (endpoint: string) => {
        setSelectedEndpoints(prev => 
            prev.includes(endpoint) 
                ? prev.filter(e => e !== endpoint)
                : [...prev, endpoint]
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="text-indigo-600 hover:text-indigo-800 mb-4"
                    >
                        ← Back to Admin Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Adda.io Login & Data Capture</h1>
                    <p className="mt-2 text-gray-600">
                        Login to Adda.io and capture network requests, cookies, tokens, and endpoints
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    {!showIframe ? (
                        <div className="space-y-4">
                            <button
                                onClick={handleLogin}
                                disabled={isLoggingIn}
                                className={`px-6 py-3 rounded-md text-white font-medium ${
                                    isLoggingIn
                                        ? 'bg-indigo-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {isLoggingIn ? 'Opening Adda.io Login...' : 'Open Adda.io Login Page'}
                            </button>
                            <p className="text-sm text-gray-600">
                                This will open a browser window with the real Adda.io login page. 
                                Please enter your credentials in that window.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm text-blue-700">
                                            <strong>Browser window opened!</strong> Please login to Adda.io in the browser window that opened.
                                            This page will automatically detect when you've successfully logged in.
                                        </p>
                                        <p className="text-xs text-blue-600 mt-2">
                                            <strong>Note:</strong> The browser window will stay open even after login is detected. 
                                            You can close it manually when you're done, or it will close automatically after 5 minutes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 animate-pulse" style={{ width: '100%' }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {statusMessage || 'Waiting for login...'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCancelLogin}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {loginResult && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Login Summary</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-gray-500">Cookies Captured</div>
                                    <div className="text-2xl font-bold">{loginResult.cookies.length}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Network Requests</div>
                                    <div className="text-2xl font-bold">{loginResult.networkRequestsCount}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">AJAX Endpoints</div>
                                    <div className="text-2xl font-bold">{loginResult.endpoints.ajax.length}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Tokens Found</div>
                                    <div className="text-2xl font-bold">{Object.keys(loginResult.tokens).length}</div>
                                </div>
                            </div>
                        </div>

                        {/* Cookies */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Captured Cookies</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value (truncated)</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loginResult.cookies.map((cookie, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 text-sm font-medium">{cookie.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500 font-mono">{cookie.value}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{cookie.domain}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{cookie.path}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Headers */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Captured Headers</h2>
                            <div className="bg-gray-50 p-4 rounded">
                                <pre className="text-sm overflow-x-auto">
                                    {JSON.stringify(loginResult.headers, null, 2)}
                                </pre>
                            </div>
                        </div>

                        {/* Tokens */}
                        {Object.keys(loginResult.tokens).length > 0 && (
                            <div className="bg-white shadow rounded-lg p-6">
                                <h2 className="text-xl font-semibold mb-4">Captured Tokens</h2>
                                <div className="bg-gray-50 p-4 rounded">
                                    <pre className="text-sm overflow-x-auto">
                                        {JSON.stringify(loginResult.tokens, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Endpoints */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Discovered Endpoints</h2>
                            
                            {loginResult.endpoints.ajax.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium mb-2">AJAX Endpoints</h3>
                                    <div className="space-y-2">
                                        {loginResult.endpoints.ajax.map((endpoint, i) => (
                                            <label key={i} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEndpoints.includes(endpoint)}
                                                    onChange={() => toggleEndpoint(endpoint)}
                                                    className="rounded"
                                                />
                                                <code className="text-sm text-gray-700">{endpoint}</code>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {loginResult.endpoints.api.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium mb-2">API Endpoints</h3>
                                    <div className="space-y-2">
                                        {loginResult.endpoints.api.map((endpoint, i) => (
                                            <label key={i} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEndpoints.includes(endpoint)}
                                                    onChange={() => toggleEndpoint(endpoint)}
                                                    className="rounded"
                                                />
                                                <code className="text-sm text-gray-700">{endpoint}</code>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleFetchData}
                                disabled={selectedEndpoints.length === 0 || fetchingData}
                                className={`mt-4 px-6 py-2 rounded-md text-white font-medium ${
                                    selectedEndpoints.length === 0 || fetchingData
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {fetchingData ? 'Fetching Data...' : `Fetch Data from ${selectedEndpoints.length} Endpoint(s)`}
                            </button>
                        </div>

                        {/* Sample Network Requests */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Sample Network Requests</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loginResult.sampleRequests.map((req, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 text-sm font-medium">{req.method}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700 font-mono break-all">{req.url}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{req.type}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{req.status || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Fetched Data */}
                {fetchedData && (
                    <div className="bg-white shadow rounded-lg p-6 mt-6">
                        <h2 className="text-xl font-semibold mb-4">Fetched Data</h2>
                        <div className="space-y-4">
                            {Object.entries(fetchedData).map(([endpoint, result]: [string, any]) => (
                                <div key={endpoint} className="border rounded-lg p-4">
                                    <h3 className="font-medium mb-2">
                                        <code className="text-sm">{endpoint}</code>
                                        {result.status && (
                                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                                result.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {result.status}
                                            </span>
                                        )}
                                    </h3>
                                    {result.error ? (
                                        <div className="text-red-600 text-sm">{result.error}</div>
                                    ) : (
                                        <div className="bg-gray-50 p-4 rounded mt-2">
                                            <pre className="text-xs overflow-x-auto max-h-96 overflow-y-auto">
                                                {JSON.stringify(result.data, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

