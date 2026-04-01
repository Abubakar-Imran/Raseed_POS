import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";

// POST /api/auth/login — Retailer email/password login
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        const { data: retailer } = await supabase
            .from("Retailer")
            .select("*")
            .eq("email", email)
            .single();

        if (!retailer) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        if (!retailer.emailVerifiedAt) {
            return NextResponse.json(
                { message: "Verify your email before signing in." },
                { status: 403 }
            );
        }

        if (!retailer.passwordHash) {
            return NextResponse.json(
                { message: "Complete password setup from your verification email before signing in." },
                { status: 403 }
            );
        }

        const isMatch = await bcrypt.compare(password, retailer.passwordHash);
        if (!isMatch) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        const access_token = signToken({
            sub: retailer.id,
            email: retailer.email,
            role: "retailer",
        });

        return NextResponse.json({ access_token, retailerId: retailer.id });
    } catch (error) {
        console.error("Login Retailer Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
