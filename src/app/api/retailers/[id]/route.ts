import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/retailers/[id] — Get retailer by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const retailer = await prisma.retailer.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, createdAt: true },
        });

        if (!retailer) {
            return NextResponse.json(
                { message: "Retailer not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(retailer);
    } catch (error) {
        console.error("Get Retailer Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
