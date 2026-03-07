import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

        let customer = await prisma.customer.findUnique({ where: { email } });
        if (!customer) {
            customer = await prisma.customer.create({ data: { email } });
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
