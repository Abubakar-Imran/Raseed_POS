import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/lib/supabase-server";
import { verifyOnboardingToken } from "@/lib/auth";

// POST /api/auth/register/set-password — finalize retailer onboarding
export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { message: "Token and password are required." },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters long." },
                { status: 400 }
            );
        }

        const payload = verifyOnboardingToken(token);

        if (!payload) {
            return NextResponse.json(
                { message: "Invalid or expired password setup link." },
                { status: 400 }
            );
        }

        const { data: retailer, error } = await supabase
            .from("Retailer")
            .select("id, email, emailVerifiedAt, passwordHash")
            .eq("id", payload.sub)
            .maybeSingle();

        if (error) {
            console.error("Retailer set-password lookup error:", error);
            return NextResponse.json(
                { message: "Failed to complete password setup." },
                { status: 500 }
            );
        }

        if (!retailer) {
            return NextResponse.json(
                { message: "Retailer not found." },
                { status: 404 }
            );
        }

        if (!retailer.emailVerifiedAt) {
            return NextResponse.json(
                { message: "Verify your email before setting a password." },
                { status: 403 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const { error: updateError } = await supabase
            .from("Retailer")
            .update({
                passwordHash,
                verificationTokenHash: null,
                verificationTokenExpiresAt: null,
            })
            .eq("id", retailer.id);

        if (updateError) {
            console.error("Retailer password update error:", updateError);
            return NextResponse.json(
                { message: "Failed to save password." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Password set successfully. You can now sign in.",
            retailerId: retailer.id,
        });
    } catch (error) {
        console.error("Set Retailer Password Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}