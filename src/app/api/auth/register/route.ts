import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// POST /api/auth/register — Retailer registration
export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        const existing = await prisma.retailer.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { message: "Retailer with this email already exists." },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const retailer = await prisma.retailer.create({
            data: { name, email, passwordHash },
        });

        await prisma.branch.create({
            data: {
                retailerId: retailer.id,
                name: "Main Branch",
                location: "HQ",
            },
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
