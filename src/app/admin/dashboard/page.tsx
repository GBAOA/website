
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Resident {
    id: string;
    name: string;
    flat: string;
    email: string;
    phone: string;
    type: string;
}

interface Flat {
    id: string;
    block: string;
    number: string;
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [syncing, setSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState<string | null>(null);
    const [residents, setResidents] = useState<Resident[]>([]);
    const [flats, setFlats] = useState<Flat[]>([]);
    const [error, setError] = useState<string | null>(null);

    const startSync = async () => {
        setSyncing(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/sync', { method: 'POST' });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Sync failed');
            }

            setResidents(data.data.residents || []);
            setFlats(data.data.flats || []);
            setLastSynced(data.data.syncedAt);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        {lastSynced && (
                            <span className="text-sm text-gray-500">
                                Last Synced: {new Date(lastSynced).toLocaleString()}
                            </span>
                        )}
                        <button
                            onClick={() => router.push('/adda-login')}
                            className="px-4 py-2 rounded-md text-white font-medium bg-green-600 hover:bg-green-700"
                        >
                            Adda.io Login
                        </button>
                        <button
                            onClick={startSync}
                            disabled={syncing}
                            className={`px-4 py-2 rounded-md text-white font-medium ${syncing
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {syncing ? 'Connecting to Adda...' : 'Sync from Adda.io'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Residents</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{residents.length}</dd>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Flats</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{flats.length}</dd>
                        </div>
                    </div>
                </div>

                {/* Data Tables */}
                {residents.length > 0 && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Residents</h3>
                        </div>
                        <div className="border-t border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flat</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {residents.slice(0, 50).map((r, i) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.flat}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.email}</td>
                                            </tr>
                                        ))}
                                        {residents.length > 50 && (
                                            <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-400">... and {residents.length - 50} more</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
