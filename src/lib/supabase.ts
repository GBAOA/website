import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (uses anon key)
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side Supabase client (uses service role key - more permissions)
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

// Database types (you can generate these later with Supabase CLI)
export interface AddaSessionRow {
    id: string;
    session_id: string;
    status: string;
    cookies: any;
    headers: any;
    tokens: any;
    network_requests: any;
    endpoints: any;
    created_at: string;
    expires_at: string;
    last_updated: string;
}

export interface ResidentRow {
    id: string;
    adda_id: string | null;
    name: string;
    flat: string | null;
    email: string | null;
    phone: string | null;
    type: string | null;
    synced_at: string;
    created_at: string;
    updated_at: string;
}

export interface FlatRow {
    id: string;
    adda_id: string | null;
    block: string | null;
    number: string | null;
    synced_at: string;
    created_at: string;
    updated_at: string;
}

