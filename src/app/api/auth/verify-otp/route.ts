import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { signToken } from "@/lib/auth";
import { otpStore } from "../send-otp/route";

// POST /api/auth/verify-otp — Verify customer OTP and issue JWT
export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();
        if (!email || !otp) {
            return NextResponse.json(
                { message: "Email and OTP are required" },
                { status: 400 }
            );
        }

        const storedOtp = otpStore.get(email);

        if (!storedOtp || storedOtp !== String(otp)) {
            // Allow bypass with '0000' for development
            if (String(otp) !== "0000") {
                return NextResponse.json(
                    { message: "Invalid or expired OTP" },
                    { status: 400 }
                );
            }
        }

        otpStore.delete(email);

        const { data: existingCustomer } = await supabase
            .from("Customer")
            .select("*")
            .eq("email", email)
            .single();

        let customer = existingCustomer;
        if (!customer) {
            const { data: newCustomer, error: insertErr } = await supabase
                .from("Customer")
                .insert({ id: crypto.randomUUID(), email })
                .select()
                .single();
            if (insertErr || !newCustomer) {
                console.error("Customer insert error:", insertErr);
                return NextResponse.json(
                    { message: "Failed to create customer", detail: insertErr?.message },
                    { status: 500 }
                );
            }
            customer = newCustomer;
        }

        const access_token = signToken({
            sub: customer.id,
            email: customer.email,
            role: "customer",
        });

        return NextResponse.json({ access_token, customerId: customer.id });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
