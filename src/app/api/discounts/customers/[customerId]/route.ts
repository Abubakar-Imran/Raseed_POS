import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

// GET /api/discounts/customers/[customerId] — Get available discounts for customer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ customerId: string }> }
) {
    try {
        const { customerId } = await params;
        const now = new Date().toISOString();
        const { data: discounts } = await supabase
            .from("Discount")
            .select("id, customerId, retailerId, discountPercentage, status, expiresAt, createdAt, retailer:Retailer(name)")
            .eq("customerId", customerId)
            .eq("status", "AVAILABLE")
            .gt("expiresAt", now)
            .order("createdAt", { ascending: false });

        return NextResponse.json(discounts ?? []);
    } catch (error) {
        console.error("Get Customer Discounts Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
