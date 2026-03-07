import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/feedback/retailers/[retailerId] — Get feedback for retailer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ retailerId: string }> }
) {
    try {
        const { retailerId } = await params;
        const { searchParams } = new URL(request.url);
        const skip = parseInt(searchParams.get("skip") || "0");
        const take = parseInt(searchParams.get("take") || "50");

        const feedbacks = await prisma.feedback.findMany({
            where: { receipt: { retailerId } },
            include: {
                customer: { select: { email: true } },
                receipt: { select: { billNumber: true, totalAmount: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take,
        });

        return NextResponse.json(feedbacks);
    } catch (error) {
        console.error("Get Retailer Feedback Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
