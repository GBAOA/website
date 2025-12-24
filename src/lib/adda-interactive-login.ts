import { Browser, Page, HTTPRequest, HTTPResponse } from 'puppeteer-core';
import { storeSession } from './adda-session-store-db';

export interface InteractiveLoginSession {
    sessionId: string;
    browserWSEndpoint?: string;
    status: 'waiting' | 'logged_in' | 'failed' | 'timeout';
    cookies?: any[];
    headers?: Record<string, string>;
    networkRequests?: NetworkRequest[];
    endpoints?: {
        ajax: string[];
        api: string[];
        other: string[];
    };
    tokens?: Record<string, string>;
    error?: string;
}

export interface NetworkRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    postData?: string;
    response?: {
        status: number;
        statusText: string;
        headers: Record<string, string>;
        body?: string;
    };
    type: string;
    timestamp: number;
}

// Store active login sessions with captured data
interface ActiveSession {
    browser: Browser;
    page: Page;
    startTime: number;
    networkRequests: NetworkRequest[];
    endpoints: {
        ajax: string[];
        api: string[];
        other: string[];
    };
    tokens: Record<string, string>;
}

const activeSessions = new Map<string, ActiveSession>();

const SESSION_TIMEOUT_MS = 1000 * 60 * 10; // 10 minutes

export async function startInteractiveLogin(): Promise<{ sessionId: string; browserWSEndpoint: string }> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    console.log(`[InteractiveLogin] Starting session ${sessionId}`);

    let browser: Browser;
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.NETLIFY;

    if (isProduction) {
        console.log('[InteractiveLogin] Running in Production/Lambda mode (Headless)');
        const chromium = await import('@sparticuz/chromium');
        const puppeteer = await import('puppeteer-core');

        const chromiumMod = (chromium.default || chromium) as any;

        browser = await puppeteer.default.launch({
            args: chromiumMod.args,
            defaultViewport: chromiumMod.defaultViewport,
            executablePath: await chromiumMod.executablePath(),
            headless: chromiumMod.headless,
            ignoreHTTPSErrors: true,
        } as any) as unknown as Browser;
    } else {
        console.log('[InteractiveLogin] Running in Local mode (Interactive)');
        const puppeteer = await import('puppeteer');
        browser = await puppeteer.default.launch({
            headless: false, // Show browser window locally
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--window-size=1280,800'
            ],
            defaultViewport: { width: 1280, height: 800 }
        }) as unknown as Browser;
    }

    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    const networkRequests: NetworkRequest[] = [];
    const capturedEndpoints = {
        ajax: [] as string[],
        api: [] as string[],
        other: [] as string[]
    };
    const tokens: Record<string, string> = {};

    // Capture network requests
    page.on('request', (request: HTTPRequest) => {
        const url = request.url();
        const method = request.method();
        const headers = request.headers();
        const postData = request.postData();
        const type = request.resourceType();

        networkRequests.push({
            url,
            method,
            headers: { ...headers },
            postData,
            type,
            timestamp: Date.now()
        });

        // Categorize endpoints
        if (url.includes('ajax') || url.includes('.php')) {
            if (url.includes('ajax_')) {
                capturedEndpoints.ajax.push(url);
            } else {
                capturedEndpoints.api.push(url);
            }
        }

        // Extract tokens - especially bearer tokens from request headers
        if (headers['authorization']) {
            tokens['authorization'] = headers['authorization'];
            // Extract bearer token separately
            if (headers['authorization'].startsWith('Bearer ')) {
                tokens['bearer-token'] = headers['authorization'].substring(7);
            }
        }
        if (headers['x-csrf-token']) tokens['csrf-token'] = headers['x-csrf-token'];
        if (headers['x-auth-token']) tokens['auth-token'] = headers['x-auth-token'];
        // Also check for other common token header names
        Object.keys(headers).forEach(key => {
            const lowerKey = key.toLowerCase();
            if ((lowerKey.includes('token') || lowerKey.includes('auth')) && !tokens[lowerKey]) {
                tokens[lowerKey] = headers[key];
            }
        });
    });

    // Capture responses
    page.on('response', async (response: HTTPResponse) => {
        const url = response.url();
        const status = response.status();
        const headers = response.headers();

        const reqIndex = networkRequests.findIndex(r => r.url === url && !r.response);
        if (reqIndex >= 0) {
            try {
                let body: string | undefined;
                const contentType = headers['content-type'] || '';
                if (contentType.includes('application/json') || contentType.includes('text/')) {
                    try {
                        body = await response.text();
                    } catch (e) { }
                }

                networkRequests[reqIndex].response = {
                    status,
                    statusText: response.statusText(),
                    headers: { ...headers },
                    body
                };

                // Extract tokens from response headers
                if (headers['x-csrf-token']) tokens['csrf-token'] = headers['x-csrf-token'];
                if (headers['authorization']) {
                    tokens['authorization'] = headers['authorization'];
                    if (headers['authorization'].startsWith('Bearer ')) {
                        tokens['bearer-token'] = headers['authorization'].substring(7);
                    }
                }

                // Extract tokens from response body
                if (body) {
                    try {
                        const data = JSON.parse(body);
                        Object.keys(data).forEach(key => {
                            const lowerKey = key.toLowerCase();
                            if (lowerKey.includes('token') || lowerKey.includes('csrf') ||
                                lowerKey.includes('access') || lowerKey.includes('refresh') ||
                                lowerKey.includes('auth')) {
                                tokens[key] = String(data[key]);
                                // If it's a bearer token format
                                if (String(data[key]).startsWith('Bearer ')) {
                                    tokens['bearer-token'] = String(data[key]).substring(7);
                                }
                            }
                        });
                    } catch (e) {
                        // Try to find bearer tokens in plain text
                        if (body.includes('Bearer ') || body.includes('bearer ')) {
                            const bearerMatch = body.match(/[Bb]earer\s+([A-Za-z0-9\-._~+/]+=*)/);
                            if (bearerMatch && bearerMatch[1]) {
                                tokens['bearer-token'] = bearerMatch[1];
                            }
                        }
                    }
                }
            } catch (e) { }
        }
    });

    // Navigate to correct login page: https://auth.adda.io/login
    try {
        const loginUrl = 'https://auth.adda.io/login';
        console.log(`[InteractiveLogin] Navigating to ${loginUrl} for session ${sessionId}`);
        await page.goto(loginUrl, {
            waitUntil: 'domcontentloaded', // Less strict than networkidle2
            timeout: 60000, // Longer timeout
        });
        console.log(`[InteractiveLogin] Successfully navigated to login page for session ${sessionId}`);
    } catch (navError: any) {
        console.warn(`[InteractiveLogin] Navigation warning for session ${sessionId}:`, navError.message);
        // Continue anyway - page might have loaded partially
    }

    // Handle cookie banner with retries
    try {
        await new Promise((r) => setTimeout(r, 2000)); // Wait for page to settle
        const acceptBtn = await page.$('#acceptbutton').catch(() => null);
        if (acceptBtn) {
            await acceptBtn.click();
            await new Promise((r) => setTimeout(r, 1000));
            console.log(`[InteractiveLogin] Cookie banner accepted for session ${sessionId}`);
        }
    } catch (e) {
        console.log(`[InteractiveLogin] No cookie banner found for session ${sessionId}`);
    }

    // Store session with capture containers
    activeSessions.set(sessionId, {
        browser,
        page,
        startTime: Date.now(),
        networkRequests,
        endpoints: capturedEndpoints,
        tokens
    });

    // Don't auto-close on timeout - let user control the browser
    // The checkLoginStatus will handle timeout detection

    return {
        sessionId,
        browserWSEndpoint: browser.wsEndpoint()
    };
}

export async function checkLoginStatus(sessionId: string): Promise<InteractiveLoginSession> {
    const session = activeSessions.get(sessionId);

    if (!session) {
        return {
            sessionId,
            status: 'failed',
            error: 'Session not found or expired'
        };
    }

    const { browser, page, startTime, networkRequests, endpoints: capturedEndpoints, tokens } = session;

    try {
        // Check if browser is still connected
        if (!browser.isConnected()) {
            console.log(`[InteractiveLogin] Browser disconnected for session ${sessionId}`);
            activeSessions.delete(sessionId);
            return {
                sessionId,
                status: 'failed',
                error: 'Browser disconnected (user may have closed it)'
            };
        }

        // Safely check current URL and page state
        let currentUrl: string;
        let hasPasswordField: boolean = false;
        let cookies: any[] = [];

        try {
            currentUrl = page.url();
            hasPasswordField = !!(await page.$('input[type="password"]').catch(() => null));
            cookies = await page.cookies();
        } catch (pageError: any) {
            console.warn(`[InteractiveLogin] Error accessing page for session ${sessionId}:`, pageError.message);
            // Don't close browser on page access errors - might be temporary
            return {
                sessionId,
                status: 'waiting'
            };
        }

        const phpsessid = cookies.find(c => c.name === 'PHPSESSID');
        const isOnLoginPage = currentUrl.includes('/login') || currentUrl.includes('/login_auth');

        console.log(`[InteractiveLogin] Session ${sessionId} check: URL=${currentUrl}, hasPassword=${hasPasswordField}, hasPHPSESSID=${!!phpsessid}, isOnLoginPage=${isOnLoginPage}`);

        // More strict login detection: 
        // 1. Must have PHPSESSID or bearer token
        // 2. Must NOT be on login page
        // 3. Must NOT have password field visible
        // 4. Wait a bit after navigation to ensure login is complete
        const hasValidSession = phpsessid || tokens['bearer-token'];
        if (hasValidSession && !isOnLoginPage && !hasPasswordField) {
            // Double-check: wait a moment and verify again to avoid false positives
            await new Promise(r => setTimeout(r, 2000));

            try {
                const verifyUrl = page.url();
                const verifyPassword = !!(await page.$('input[type="password"]').catch(() => null));
                const verifyCookies = await page.cookies();
                const verifyPhpsessid = verifyCookies.find(c => c.name === 'PHPSESSID');

                if (verifyPhpsessid && !verifyUrl.includes('/login') && !verifyPassword) {
                    console.log(`[InteractiveLogin] Session ${sessionId} - Login confirmed!`);

                    // Build headers
                    const commonHeaders: Record<string, string> = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'application/json, text/javascript, */*; q=0.01',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Referer': verifyUrl,
                        'Origin': 'https://www.adda.io'
                    };

                    // Build headers with bearer token if found
                    if (tokens['bearer-token']) {
                        commonHeaders['Authorization'] = `Bearer ${tokens['bearer-token']}`;
                    } else if (tokens['authorization']) {
                        commonHeaders['Authorization'] = tokens['authorization'];
                    }

                    const result: InteractiveLoginSession = {
                        sessionId,
                        status: 'logged_in',
                        cookies: verifyCookies,
                        headers: commonHeaders,
                        networkRequests: [...networkRequests], // Copy array
                        endpoints: {
                            ajax: [...capturedEndpoints.ajax],
                            api: [...capturedEndpoints.api],
                            other: [...capturedEndpoints.other]
                        },
                        tokens: { ...tokens }
                    };

                    // IMPORTANT: Store session BEFORE browser might close
                    // This ensures session persists even if user closes browser
                    await storeSession(sessionId, result);
                    console.log(`[InteractiveLogin] Session ${sessionId} stored successfully with ${verifyCookies.length} cookies and ${Object.keys(tokens).length} tokens`);

                    // DON'T close browser immediately - let user see the result
                    // Browser will be closed when session times out or user cancels
                    // activeSessions.delete(sessionId); // Keep session active for a bit

                    // Set a delayed cleanup (5 minutes) to close browser
                    // But session data is already saved, so closing browser won't lose data
                    setTimeout(async () => {
                        if (activeSessions.has(sessionId)) {
                            const delayedSession = activeSessions.get(sessionId);
                            if (delayedSession) {
                                console.log(`[InteractiveLogin] Closing browser for session ${sessionId} after delay`);
                                await delayedSession.browser.close().catch(() => { });
                                activeSessions.delete(sessionId);
                            }
                        }
                    }, 1000 * 60 * 5); // 5 minutes

                    return result;
                } else {
                    console.log(`[InteractiveLogin] Session ${sessionId} - Login not confirmed on second check`);
                }
            } catch (verifyError: any) {
                console.warn(`[InteractiveLogin] Error during login verification:`, verifyError.message);
                // Don't close browser, just return waiting status
            }
        }

        // Check timeout
        if (Date.now() - startTime > SESSION_TIMEOUT_MS) {
            console.log(`[InteractiveLogin] Session ${sessionId} timed out after ${SESSION_TIMEOUT_MS}ms`);
            // Don't close browser on timeout - let user decide
            return {
                sessionId,
                status: 'timeout',
                error: 'Login timeout - please try again or check if login was successful'
            };
        }

        return {
            sessionId,
            status: 'waiting'
        };

    } catch (error: any) {
        console.error(`[InteractiveLogin] Error checking session ${sessionId}:`, error);
        // Don't close browser on errors - might be recoverable
        // Only return error status, keep browser open
        return {
            sessionId,
            status: 'waiting', // Keep waiting instead of failing
            error: `Check error: ${error.message}`
        };
    }
}

export async function cancelSession(sessionId: string): Promise<void> {
    const session = activeSessions.get(sessionId);
    if (session) {
        // Before closing, try to save any session data if login was successful
        try {
            const currentUrl = session.page.url();
            const cookies = await session.page.cookies();
            const hasSession = cookies.find(c =>
                c.name === 'PHPSESSID' ||
                c.name.toLowerCase().includes('session') ||
                c.name.toLowerCase().includes('auth')
            );

            // If we have a session but haven't stored it yet, try to store it now
            if (hasSession && !currentUrl.includes('/login')) {
                console.log(`[InteractiveLogin] Saving session data before closing browser for session ${sessionId}`);
                const result: InteractiveLoginSession = {
                    sessionId,
                    status: 'logged_in',
                    cookies,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'application/json, text/javascript, */*; q=0.01',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Referer': currentUrl,
                        'Origin': 'https://www.adda.io'
                    },
                    networkRequests: [...session.networkRequests],
                    endpoints: {
                        ajax: [...session.endpoints.ajax],
                        api: [...session.endpoints.api],
                        other: [...session.endpoints.other]
                    },
                    tokens: { ...session.tokens }
                };
                await storeSession(sessionId, result);
            }
        } catch (e) {
            console.warn(`[InteractiveLogin] Could not save session before closing:`, e);
        }

        await session.browser.close().catch(() => { });
        activeSessions.delete(sessionId);
    }
}

