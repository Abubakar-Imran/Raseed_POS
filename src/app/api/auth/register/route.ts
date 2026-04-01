import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { createHash, randomBytes } from "crypto";
import { sendRetailerVerificationEmail } from "@/lib/mailer";

// POST /api/auth/register — Retailer registration
export async function POST(request: NextRequest) {
    try {
        const { name, email } = await request.json();

        if (!name || !email) {
            return NextResponse.json(
                { message: "Store name and email are required." },
                { status: 400 }
            );
        }

        const verificationToken = randomBytes(32).toString("hex");
        const verificationTokenHash = createHash("sha256")
            .update(verificationToken)
            .digest("hex");
        const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

        const { data: existing } = await supabase
            .from("Retailer")
            .select("id, emailVerifiedAt")
            .eq("email", email)
            .maybeSingle();

        const verificationUrl = `${appBaseUrl}/auth/register/verify?token=${verificationToken}`;

        if (existing?.emailVerifiedAt) {
            return NextResponse.json(
                { message: "A verified retailer already exists with this email." },
                { status: 400 }
            );
        }

        if (existing) {
            const { error: updateError } = await supabase
                .from("Retailer")
                .update({
                    name,
                    verificationTokenHash,
                    verificationTokenExpiresAt,
                })
                .eq("id", existing.id);

            if (updateError) {
                console.error("Register update error:", updateError);
                return NextResponse.json(
                    { message: "Failed to update retailer registration", detail: updateError.message },
                    { status: 500 }
                );
            }

            await sendRetailerVerificationEmail(email, verificationUrl);

            return NextResponse.json({
                message: "Verification email resent. Check your inbox to continue setting up your password.",
            });
        }

        const { data: retailer, error } = await supabase
            .from("Retailer")
            .insert({
                id: crypto.randomUUID(),
                name,
                email,
                passwordHash: null,
                verificationTokenHash,
                verificationTokenExpiresAt,
            })
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

        await sendRetailerVerificationEmail(email, verificationUrl);

        return NextResponse.json({
            message: "Retailer registered successfully. Check your email to verify your store and continue setup.",
        });
    } catch (error) {
        console.error("Register Retailer Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
