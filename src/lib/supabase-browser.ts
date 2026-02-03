import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Browser-side Supabase client using the public anon key.
export function getSupabaseBrowser(): SupabaseClient {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        throw new Error('Supabase environment variables are missing');
    }

    return createClient(url, anonKey);
}
