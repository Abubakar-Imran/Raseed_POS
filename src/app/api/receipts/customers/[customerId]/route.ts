import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

// GET /api/receipts/customers/[customerId] — Get receipts for a customer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ customerId: string }> }
) {
    try {
        const { customerId } = await params;
        const { data: receipts } = await supabase
            .from("Receipt")
            .select("id, billNumber, totalAmount, createdAt, paymentMethod, customerId, retailerId, branchId, items:ReceiptItem(id, itemName, quantity, price), retailer:Retailer(id, name), branch:Branch(id, name)")
            .eq("customerId", customerId)
            .order("createdAt", { ascending: false });

        return NextResponse.json(receipts ?? []);
    } catch (error) {
        console.error("Get Customer Receipts Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
