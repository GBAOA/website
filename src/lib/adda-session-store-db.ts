import { InteractiveLoginSession } from './adda-interactive-login';
import { supabaseAdmin, AddaSessionRow } from './supabase';

const SESSION_EXPIRY_MS = 1000 * 60 * 60; // 1 hour

/**
 * Store session in database
 */
export async function storeSession(sessionId: string, session: InteractiveLoginSession): Promise<void> {
    try {
        const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS).toISOString();

        const sessionData: Partial<AddaSessionRow> = {
            session_id: sessionId,
            status: session.status,
            cookies: session.cookies || null,
            headers: session.headers || null,
            tokens: session.tokens || null,
            network_requests: session.networkRequests || null,
            endpoints: session.endpoints || null,
            expires_at: expiresAt,
            last_updated: new Date().toISOString()
        };

        // Use upsert to update if exists, insert if new
        const { error } = await supabaseAdmin
            .from('adda_sessions')
            .upsert(sessionData, {
                onConflict: 'session_id',
                ignoreDuplicates: false
            });

        if (error) {
            console.error('[SessionStore] Error storing session:', error);
            throw error;
        }

        console.log(`[SessionStore] Session ${sessionId} stored successfully`);
    } catch (error) {
        console.error('[SessionStore] Failed to store session:', error);
        throw error;
    }
}

/**
 * Get session from database
 */
export async function getSession(sessionId: string): Promise<InteractiveLoginSession | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('adda_sessions')
            .select('*')
            .eq('session_id', sessionId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                return null;
            }
            console.error('[SessionStore] Error getting session:', error);
            return null;
        }

        // Check if expired
        if (new Date(data.expires_at) < new Date()) {
            console.log(`[SessionStore] Session ${sessionId} expired`);
            // Optionally delete expired session
            await supabaseAdmin
                .from('adda_sessions')
                .delete()
                .eq('session_id', sessionId);
            return null;
        }

        // Convert database row to InteractiveLoginSession
        return {
            sessionId: data.session_id,
            status: data.status as any,
            cookies: data.cookies || [],
            headers: data.headers || {},
            networkRequests: data.network_requests || [],
            endpoints: data.endpoints || {
                ajax: [],
                api: [],
                other: []
            },
            tokens: data.tokens || {}
        };
    } catch (error) {
        console.error('[SessionStore] Failed to get session:', error);
        return null;
    }
}

/**
 * Get latest logged-in session
 */
export async function getLatestSession(): Promise<InteractiveLoginSession | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('adda_sessions')
            .select('*')
            .eq('status', 'logged_in')
            .gt('expires_at', new Date().toISOString())
            .order('last_updated', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('[SessionStore] Error getting latest session:', error);
            return null;
        }

        return {
            sessionId: data.session_id,
            status: data.status as any,
            cookies: data.cookies || [],
            headers: data.headers || {},
            networkRequests: data.network_requests || [],
            endpoints: data.endpoints || {
                ajax: [],
                api: [],
                other: []
            },
            tokens: data.tokens || {}
        };
    } catch (error) {
        console.error('[SessionStore] Failed to get latest session:', error);
        return null;
    }
}

/**
 * Cleanup expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
    try {
        const { error } = await supabaseAdmin
            .from('adda_sessions')
            .delete()
            .lt('expires_at', new Date().toISOString());

        if (error) {
            console.error('[SessionStore] Error cleaning up sessions:', error);
        }
    } catch (error) {
        console.error('[SessionStore] Failed to cleanup sessions:', error);
    }
}

