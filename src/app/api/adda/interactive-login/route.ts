import { NextResponse } from 'next/server';
import { startInteractiveLogin, checkLoginStatus, cancelSession } from '@/lib/adda-interactive-login';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, sessionId } = body;

        if (action === 'start') {
            console.log('[API] Starting interactive login session...');
            const { sessionId: newSessionId, browserWSEndpoint } = await startInteractiveLogin();
            
            return NextResponse.json({
                success: true,
                sessionId: newSessionId,
                browserWSEndpoint,
                message: 'Browser window opened. Please login to Adda.io in the browser window.'
            });
        }

        if (action === 'check' && sessionId) {
            const status = await checkLoginStatus(sessionId);
            
            if (status.status === 'logged_in') {
                // Return captured data
                return NextResponse.json({
                    success: true,
                    status: 'logged_in',
                    data: {
                        cookies: status.cookies?.map(c => ({
                            name: c.name,
                            value: c.value,
                            domain: c.domain,
                            path: c.path,
                            httpOnly: c.httpOnly,
                            secure: c.secure
                        })) || [],
                        headers: status.headers || {},
                        endpoints: status.endpoints || {
                            ajax: [],
                            api: [],
                            other: []
                        },
                        tokens: status.tokens || {},
                        networkRequestsCount: status.networkRequests?.length || 0,
                        sampleRequests: (status.networkRequests || [])
                            .filter(r => r.url.includes('ajax') || r.url.includes('.php'))
                            .slice(0, 10)
                            .map(r => ({
                                url: r.url,
                                method: r.method,
                                type: r.type,
                                status: r.response?.status,
                                hasResponse: !!r.response
                            }))
                    }
                });
            }

            return NextResponse.json({
                success: true,
                status: status.status,
                error: status.error
            });
        }

        if (action === 'cancel' && sessionId) {
            await cancelSession(sessionId);
            return NextResponse.json({
                success: true,
                message: 'Session cancelled'
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action or missing sessionId' },
            { status: 400 }
        );

    } catch (error: any) {
        console.error('[API] Interactive login error:', error);
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

