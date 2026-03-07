import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

// POST /api/discounts/rules — Create a new loyalty rule
export async function POST(request: NextRequest) {
    try {
        const { retailerId, ruleType, threshold, discountPercentage, validDays } =
            await request.json();

        const { data: rule, error } = await supabase
            .from("LoyaltyRule")
            .insert({
                id: crypto.randomUUID(),
                retailerId,
                ruleType,
                threshold,
                discountPercentage,
                validDays: validDays || 30,
            })
            .select()
            .single();

        if (error || !rule) {
            console.error("Create rule error:", error);
            return NextResponse.json(
                { message: "Failed to create rule", detail: error?.message },
                { status: 500 }
            );
        }

        return NextResponse.json(rule);
    } catch (error) {
        console.error("Create Rule Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
