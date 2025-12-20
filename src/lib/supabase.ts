import { createClient } from '@supabase/supabase-js';

/**
 * Client-side Supabase Client
 * 
 * This is safe to use in both client and server components.
 * It uses the public ANON_KEY which has limited permissions based on
 * Row Level Security (RLS) policies.
 * 
 * For server-side operations requiring elevated permissions,
 * use supabaseAdmin from './supabase-admin' instead.
 */

// Client-side Supabase client (uses anon key - limited by RLS)
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

