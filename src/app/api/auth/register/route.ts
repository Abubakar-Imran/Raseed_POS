import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import bcrypt from "bcrypt";

// POST /api/auth/register — Retailer registration
export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        const { data: existing } = await supabase
            .from("Retailer")
            .select("id")
            .eq("email", email)
            .single();

        if (existing) {
            return NextResponse.json(
                { message: "Retailer with this email already exists." },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const { data: retailer, error } = await supabase
            .from("Retailer")
            .insert({ id: crypto.randomUUID(), name, email, passwordHash })
            .select()
            .single();

        if (error || !retailer) {
            console.error("Register insert error:", error);
            return NextResponse.json(
                { message: "Failed to create retailer", detail: error?.message },
                { status: 500 }
            );
        }

        await supabase.from("Branch").insert({
            id: crypto.randomUUID(),
            retailerId: retailer.id,
            name: "Main Branch",
            location: "HQ",
        });

        return NextResponse.json({ message: "Retailer registered successfully" });
    } catch (error) {
        console.error("Register Retailer Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
