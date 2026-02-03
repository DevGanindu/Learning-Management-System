import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-server";
import { sendTestEmail } from "../../../lib/email";

export const runtime = "nodejs";

// Simple health-check route to verify Supabase and SMTP.
export async function GET() {
    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.from("users").select("id").limit(1);
        if (error) {
            return NextResponse.json({ ok: false, supabaseError: error.message }, { status: 500 });
        }

        await sendTestEmail("you@example.com");

        return NextResponse.json({ ok: true, sampleUser: data?.[0] ?? null });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}
