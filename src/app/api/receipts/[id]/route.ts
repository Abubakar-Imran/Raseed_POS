import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/receipts/[id] — Get a single receipt by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const receipt = await prisma.receipt.findUnique({
            where: { id },
            include: {
                items: true,
                retailer: true,
                branch: true,
            },
        });
        if (!receipt) {
            return NextResponse.json(
                { message: "Receipt not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(receipt);
    } catch (error) {
        console.error("Get Receipt Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
