import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/retailers/[retailerId] — Get dashboard analytics
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ retailerId: string }> }
) {
    try {
        const { retailerId } = await params;

        const totalReceipts = await prisma.receipt.count({
            where: { retailerId },
        });

        const revenueAggr = await prisma.receipt.aggregate({
            where: { retailerId },
            _sum: { totalAmount: true },
        });

        const repeatCustomersCount = await prisma.customerLoyalty.count({
            where: {
                retailerId,
                receiptCount: { gt: 1 },
            },
        });

        const feedbackAggr = await prisma.feedback.aggregate({
            where: { receipt: { retailerId } },
            _avg: { rating: true },
        });

        return NextResponse.json({
            totalReceipts,
            totalRevenue: revenueAggr._sum.totalAmount || 0,
            repeatCustomers: repeatCustomersCount,
            averageRating: feedbackAggr._avg.rating || 0,
        });
    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
