import { NextResponse } from 'next/server';
import { getLatestSession } from '@/lib/adda-session-store-db';
import { performAddaLoginWithCapture } from '@/lib/adda-auth-enhanced';
import type { InteractiveLoginSession } from '@/lib/adda-interactive-login';

export const dynamic = 'force-dynamic';

interface AddaDataResponse {
    residents?: any[];
    flats?: any[];
    [key: string]: any;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { endpoints } = body;

        if (!endpoints || !Array.isArray(endpoints) || endpoints.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No endpoints provided' },
                { status: 400 }
            );
        }

        console.log('[API] Fetching data from Adda endpoints:', endpoints);

        // Try to get stored interactive session first, fallback to automated login
        let session: InteractiveLoginSession | null = await getLatestSession();
        
        if (!session || session.status !== 'logged_in' || !session.cookies || session.cookies.length === 0) {
            console.log('[API] No stored session found, using automated login');
            const automatedSession = await performAddaLoginWithCapture();
            session = {
                sessionId: 'automated',
                status: 'logged_in',
                cookies: automatedSession.cookies,
                headers: automatedSession.headers,
                endpoints: automatedSession.endpoints,
                tokens: automatedSession.tokens
            };
        }

        if (!session.cookies || session.cookies.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No valid session cookies found' },
                { status: 401 }
            );
        }

        // Construct cookie header
        const cookieHeader = session.cookies.map(c => `${c.name}=${c.value}`).join('; ');

        // Build headers with bearer token if available
        const requestHeaders: Record<string, string> = {
            ...session.headers,
            'Cookie': cookieHeader,
            'Referer': 'https://www.adda.io/',
            'Origin': 'https://www.adda.io'
        };

        // Add bearer token if available
        if (session.tokens && session.tokens['bearer-token']) {
            requestHeaders['Authorization'] = `Bearer ${session.tokens['bearer-token']}`;
        } else if (session.tokens && session.tokens['authorization']) {
            requestHeaders['Authorization'] = session.tokens['authorization'];
        }

        const results: Record<string, any> = {};

        // Fetch data from each endpoint
        for (const endpoint of endpoints) {
            try {
                const url = endpoint.startsWith('http') ? endpoint : `https://www.adda.io${endpoint}`;
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: requestHeaders
                });

                if (!response.ok) {
                    console.warn(`[API] Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
                    results[endpoint] = {
                        error: `HTTP ${response.status}: ${response.statusText}`,
                        status: response.status
                    };
                    continue;
                }

                const contentType = response.headers.get('content-type') || '';
                let data: any;

                if (contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        data = { raw: text.substring(0, 500) }; // Truncate for display
                    }
                }

                results[endpoint] = {
                    success: true,
                    data,
                    status: response.status,
                    headers: Object.fromEntries(response.headers.entries())
                };

            } catch (error: any) {
                console.error(`[API] Error fetching ${endpoint}:`, error);
                results[endpoint] = {
                    error: error.message || 'Unknown error'
                };
            }
        }

        return NextResponse.json({
            success: true,
            data: results,
            fetchedAt: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[API] Fetch data failed:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}

