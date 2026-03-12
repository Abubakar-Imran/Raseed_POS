import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

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

        // Fetch receipt IDs belonging to this retailer
        const { data: receiptRows } = await supabase
            .from("Receipt")
            .select("id")
            .eq("retailerId", retailerId);

        const receiptIds = receiptRows?.map((r: any) => r.id) ?? [];

        if (receiptIds.length === 0) {
            return NextResponse.json([]);
        }

        const { data: feedbacks } = await supabase
            .from("Feedback")
            .select("id, rating, comment, createdAt, customer:Customer(email), receipt:Receipt(billNumber, totalAmount, createdAt)")
            .in("receiptId", receiptIds)
            .order("createdAt", { ascending: false })
            .range(skip, skip + take - 1);

        return NextResponse.json(feedbacks ?? []);
    } catch (error) {
        console.error("Get Retailer Feedback Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
