import { InteractiveLoginSession } from './adda-interactive-login';

// In-memory session store (in production, use Redis or database)
const sessionStore = new Map<string, InteractiveLoginSession & { expiresAt: number }>();

const SESSION_EXPIRY_MS = 1000 * 60 * 60; // 1 hour

export function storeSession(sessionId: string, session: InteractiveLoginSession): void {
    sessionStore.set(sessionId, {
        ...session,
        expiresAt: Date.now() + SESSION_EXPIRY_MS
    });

    // Cleanup expired sessions
    cleanupExpiredSessions();
}

export function getSession(sessionId: string): InteractiveLoginSession | null {
    cleanupExpiredSessions();
    
    const stored = sessionStore.get(sessionId);
    if (!stored) {
        return null;
    }

    if (Date.now() > stored.expiresAt) {
        sessionStore.delete(sessionId);
        return null;
    }

    return stored;
}

export function getLatestSession(): InteractiveLoginSession | null {
    cleanupExpiredSessions();
    
    const sessions = Array.from(sessionStore.values())
        .filter(s => s.status === 'logged_in')
        .sort((a, b) => b.expiresAt - a.expiresAt);

    return sessions.length > 0 ? sessions[0] : null;
}

function cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of sessionStore.entries()) {
        if (now > session.expiresAt) {
            sessionStore.delete(sessionId);
        }
    }
}

