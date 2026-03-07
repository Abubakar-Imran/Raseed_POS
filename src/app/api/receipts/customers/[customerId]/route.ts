import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/receipts/customers/[customerId] — Get receipts for a customer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ customerId: string }> }
) {
    try {
        const { customerId } = await params;
        const receipts = await prisma.receipt.findMany({
            where: { customerId },
            include: {
                items: true,
                retailer: { select: { name: true } },
                branch: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(receipts);
    } catch (error) {
        console.error("Get Customer Receipts Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
