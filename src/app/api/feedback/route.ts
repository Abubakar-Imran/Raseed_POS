import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/feedback — Submit feedback for a receipt
export async function POST(request: NextRequest) {
    try {
        const { customerId, receiptId, rating, comment } = await request.json();

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { message: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        const receipt = await prisma.receipt.findUnique({
            where: { id: receiptId },
        });

        if (!receipt || receipt.customerId !== customerId) {
            return NextResponse.json(
                { message: "Invalid receipt" },
                { status: 400 }
            );
        }

        const feedback = await prisma.feedback.create({
            data: {
                customerId,
                receiptId,
                rating,
                comment,
            },
        });

        return NextResponse.json(feedback);
    } catch (error) {
        console.error("Submit Feedback Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
