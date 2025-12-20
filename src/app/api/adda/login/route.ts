import { NextResponse } from 'next/server';
import { performAddaLoginWithCapture } from '@/lib/adda-auth-enhanced';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        console.log('[API] Starting Adda login with network capture...');
        
        const session = await performAddaLoginWithCapture(true);

        // Return captured data
        return NextResponse.json({
            success: true,
            data: {
                cookies: session.cookies.map(c => ({
                    name: c.name,
                    value: c.value.substring(0, 20) + '...', // Truncate for security
                    domain: c.domain,
                    path: c.path,
                    httpOnly: c.httpOnly,
                    secure: c.secure
                })),
                headers: session.headers,
                endpoints: session.endpoints,
                tokens: Object.keys(session.tokens).reduce((acc, key) => {
                    acc[key] = session.tokens[key].substring(0, 20) + '...';
                    return acc;
                }, {} as Record<string, string>),
                networkRequestsCount: session.networkRequests.length,
                sampleRequests: session.networkRequests
                    .filter(r => r.url.includes('ajax') || r.url.includes('.php'))
                    .slice(0, 10)
                    .map(r => ({
                        url: r.url,
                        method: r.method,
                        type: r.type,
                        status: r.response?.status,
                        hasResponse: !!r.response
                    })),
                lastUpdated: new Date(session.lastUpdated).toISOString()
            }
        });

    } catch (error: any) {
        console.error('[API] Adda login failed:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

