import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

// GET /api/discounts/rules/retailers/[retailerId] — Get loyalty rules for retailer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ retailerId: string }> }
) {
    try {
        const { retailerId } = await params;
        const { data: rules } = await supabase
            .from("LoyaltyRule")
            .select("*")
            .eq("retailerId", retailerId);

        return NextResponse.json(rules ?? []);
    } catch (error) {
        console.error("Get Rules Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
