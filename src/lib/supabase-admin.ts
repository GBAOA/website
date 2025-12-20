import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase Admin Client
 * 
 * ⚠️ WARNING: This file should ONLY be imported in server-side code:
 * - API routes (src/app/api/**)
 * - Server components
 * - Server actions
 * - Scripts
 * 
 * NEVER import this in client components or client-side code!
 * 
 * This client uses the SERVICE_ROLE_KEY which has elevated permissions
 * and must be kept secret. It bypasses Row Level Security (RLS).
 */

// Server-side Supabase client (uses service role key - full permissions)
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);
