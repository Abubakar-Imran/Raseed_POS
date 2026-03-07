import { createClient } from "@supabase/supabase-js";

// Client-side Supabase client (for realtime subscriptions in the browser)
export function getSupabaseBrowserClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!url || !anonKey) {
        console.warn("[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }

    return createClient(url, anonKey);
}

// Server-side Supabase client (for broadcasting from API routes)
export function getSupabaseServerClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!url || !serviceKey) {
        console.warn("[Supabase] Missing SUPABASE_SERVICE_ROLE_KEY — realtime notifications disabled");
    }

    return createClient(url, serviceKey);
}
