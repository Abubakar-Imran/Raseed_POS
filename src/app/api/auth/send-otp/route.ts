import { NextRequest, NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/mailer";

// Simple in-memory OTP store — shared across this module
// In production, use Redis or a database
const otpStore = new Map<string, string>();

// Export for use by verify-otp route
export { otpStore };

// POST /api/auth/send-otp — Send OTP to customer email
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        if (!email) {
            return NextResponse.json(
                { message: "Email is required" },
                { status: 400 }
            );
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        otpStore.set(email, otp);

        try {
            await sendOtpEmail(email, otp);
        } catch (mailErr) {
            console.log(`[Raseed Email Logger] OTP for ${email} is ${otp}`);
        }

        return NextResponse.json({ message: "OTP sent successfully." });
    } catch (error) {
        console.error("Send OTP Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
