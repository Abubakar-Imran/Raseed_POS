import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/discounts/rules/retailers/[retailerId] — Get loyalty rules for retailer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ retailerId: string }> }
) {
    try {
        const { retailerId } = await params;
        const rules = await prisma.loyaltyRule.findMany({
            where: { retailerId },
        });
        return NextResponse.json(rules);
    } catch (error) {
        console.error("Get Rules Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
