import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

// GET /api/receipts/[id] — Get a single receipt by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { data: receipt } = await supabase
            .from("Receipt")
            .select("id, billNumber, totalAmount, paymentMethod, createdAt, customerId, branchId, retailer:Retailer(id, name, email), branch:Branch(id, name, location), customer:Customer(id, name, email), items:ReceiptItem(id, itemName, quantity, price)")
            .eq("id", id)
            .single();

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
