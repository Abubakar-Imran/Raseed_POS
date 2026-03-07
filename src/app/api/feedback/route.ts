import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

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

        const { data: receipt } = await supabase
            .from("Receipt")
            .select("id, customerId")
            .eq("id", receiptId)
            .single();

        if (!receipt || receipt.customerId !== customerId) {
            return NextResponse.json(
                { message: "Invalid receipt" },
                { status: 400 }
            );
        }

        const { data: feedback, error } = await supabase
            .from("Feedback")
            .insert({
                id: crypto.randomUUID(),
                customerId,
                receiptId,
                rating,
                comment,
            })
            .select()
            .single();

        if (error || !feedback) {
            console.error("Feedback insert error:", error);
            return NextResponse.json(
                { message: "Failed to submit feedback", detail: error?.message },
                { status: 500 }
            );
        }

        return NextResponse.json(feedback);
    } catch (error) {
        console.error("Submit Feedback Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
