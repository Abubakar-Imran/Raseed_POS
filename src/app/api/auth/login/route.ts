import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";

// POST /api/auth/login — Retailer email/password login
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        const retailer = await prisma.retailer.findUnique({ where: { email } });
        if (!retailer) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
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
