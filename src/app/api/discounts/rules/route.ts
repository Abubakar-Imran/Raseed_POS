import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/discounts/rules — Create a new loyalty rule
export async function POST(request: NextRequest) {
    try {
        const { retailerId, ruleType, threshold, discountPercentage, validDays } =
            await request.json();

        const rule = await prisma.loyaltyRule.create({
            data: {
                retailerId,
                ruleType,
                threshold,
                discountPercentage,
                validDays: validDays || 30,
            },
        });

        return NextResponse.json(rule);
    } catch (error) {
        console.error("Create Rule Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
