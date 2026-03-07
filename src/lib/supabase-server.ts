import { createClient } from "@supabase/supabase-js";

// Server-only singleton Supabase client using the service role key.
// NEVER import this file from client components ('use client').
const globalForSupabase = globalThis as unknown as {
    supabase: any | undefined;
};

export const supabase: any =
    globalForSupabase.supabase ??
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

if (process.env.NODE_ENV !== "production") globalForSupabase.supabase = supabase;

// Non-singleton server client (e.g. for realtime broadcasting)
export function getSupabaseServerClient(): any {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}
