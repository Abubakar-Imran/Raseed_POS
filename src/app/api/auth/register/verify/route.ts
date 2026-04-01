import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabase } from "@/lib/supabase-server";
import { signOnboardingToken } from "@/lib/auth";

function hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

// POST /api/auth/register/verify — verify retailer email and start password setup
export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { message: "Verification token is required." },
                { status: 400 }
            );
        }

        const tokenHash = hashToken(token);

        const { data: retailer, error } = await supabase
            .from("Retailer")
            .select("id, name, email, emailVerifiedAt, verificationTokenExpiresAt")
            .eq("verificationTokenHash", tokenHash)
            .maybeSingle();

        if (error) {
            console.error("Retailer verify lookup error:", error);
            return NextResponse.json(
                { message: "Failed to verify retailer." },
                { status: 500 }
            );
        }

        if (!retailer) {
            return NextResponse.json(
                { message: "Invalid or expired verification link." },
                { status: 400 }
            );
        }

        if (retailer.verificationTokenExpiresAt && new Date(retailer.verificationTokenExpiresAt).getTime() < Date.now()) {
            return NextResponse.json(
                { message: "Invalid or expired verification link." },
                { status: 400 }
            );
        }

        if (!retailer.emailVerifiedAt) {
            const { error: updateError } = await supabase
                .from("Retailer")
                .update({ emailVerifiedAt: new Date().toISOString() })
                .eq("id", retailer.id);

            if (updateError) {
                console.error("Retailer verify update error:", updateError);
                return NextResponse.json(
                    { message: "Failed to mark email as verified." },
                    { status: 500 }
                );
            }
        }

        const onboardingToken = signOnboardingToken(
            {
                sub: retailer.id,
                email: retailer.email,
                purpose: "retailer-password-setup",
            },
            "15m"
        );

        return NextResponse.json({
            message: "Email verified successfully.",
            onboardingToken,
            retailer: {
                id: retailer.id,
                name: retailer.name,
                email: retailer.email,
            },
        });
    } catch (error) {
        console.error("Verify Retailer Email Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}