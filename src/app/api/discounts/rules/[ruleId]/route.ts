import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

// DELETE /api/discounts/rules/[ruleId] — Delete a loyalty rule
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ ruleId: string }> }
) {
    try {
        const { ruleId } = await params;

        const { error } = await supabase
            .from("LoyaltyRule")
            .delete()
            .eq("id", ruleId);

        if (error) {
            console.error("Delete rule error:", error);
            return NextResponse.json(
                { message: "Failed to delete rule", detail: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Rule deleted successfully" });
    } catch (error) {
        console.error("Delete Rule Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
