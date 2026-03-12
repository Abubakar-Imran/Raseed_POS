import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

// GET /api/receipts/retailers/[retailerId] — Get receipts for a retailer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ retailerId: string }> }
) {
    try {
        const { retailerId } = await params;
        const { data: receipts } = await supabase
            .from("Receipt")
            .select("id, billNumber, totalAmount, createdAt, customerId, customer:Customer(email), items:ReceiptItem(id)")
            .eq("retailerId", retailerId)
            .order("createdAt", { ascending: false });

        return NextResponse.json(receipts ?? []);
    } catch (error) {
        console.error("Get Retailer Receipts Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
