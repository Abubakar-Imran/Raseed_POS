import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/receipts/retailers/[retailerId] — Get receipts for a retailer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ retailerId: string }> }
) {
    try {
        const { retailerId } = await params;
        const receipts = await prisma.receipt.findMany({
            where: { retailerId },
            include: {
                items: true,
                customer: { select: { email: true } },
                branch: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(receipts);
    } catch (error) {
        console.error("Get Retailer Receipts Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
