/**
 * Supabase Client Configuration
 * 
 * Two clients are provided:
 * 1. supabase - For browser-side operations (uses anon key, respects RLS)
 * 2. supabaseAdmin - For server-side operations (uses service role key, bypasses RLS)
 * 
 * IMPORTANT: Only import this file in:
 * - Server Components
 * - API Routes with `export const runtime = 'nodejs'`
 * - Server Actions
 * 
 * DO NOT import in middleware or Edge Runtime code.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Singleton instances
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Get browser-safe Supabase client (uses anon key)
 * Safe to use in both browser and server
 */
export function getSupabaseClient(): SupabaseClient {
    if (!_supabase && supabaseUrl && supabaseAnonKey) {
        _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return _supabase as SupabaseClient;
}

/**
 * Get admin Supabase client (uses service role key)
 * ONLY use in server-side code - bypasses Row Level Security
 */
export function getSupabaseAdmin(): SupabaseClient {
    if (!_supabaseAdmin && supabaseUrl && supabaseServiceKey) {
        _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return _supabaseAdmin as SupabaseClient;
}

// Legacy exports for backward compatibility
export const supabase = supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : null as unknown as SupabaseClient;

export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }) 
    : null as unknown as SupabaseClient;

// Export URL for public URL generation
export const getSupabaseUrl = () => supabaseUrl;
