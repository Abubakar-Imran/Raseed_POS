import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/discounts/customers/[customerId] — Get available discounts for customer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ customerId: string }> }
) {
    try {
        const { customerId } = await params;
        const discounts = await prisma.discount.findMany({
            where: { customerId, status: "AVAILABLE" },
            include: {
                retailer: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(discounts);
    } catch (error) {
        console.error("Get Customer Discounts Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
