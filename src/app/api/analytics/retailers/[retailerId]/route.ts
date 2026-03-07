import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

// GET /api/analytics/retailers/[retailerId] — Get dashboard analytics
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ retailerId: string }> }
) {
    try {
        const { retailerId } = await params;

        // Total receipt count
        const { count: totalReceipts } = await supabase
            .from("Receipt")
            .select("*", { count: "exact", head: true })
            .eq("retailerId", retailerId);

        // Total revenue
        const { data: revenueRows } = await supabase
            .from("Receipt")
            .select("totalAmount")
            .eq("retailerId", retailerId);
        const totalRevenue =
            revenueRows?.reduce((sum: number, r: any) => sum + (r.totalAmount ?? 0), 0) ?? 0;

        // Repeat customers count
        const { count: repeatCustomers } = await supabase
            .from("CustomerLoyalty")
            .select("*", { count: "exact", head: true })
            .eq("retailerId", retailerId)
            .gt("receiptCount", 1);

        // Average feedback rating
        const { data: receiptRows } = await supabase
            .from("Receipt")
            .select("id")
            .eq("retailerId", retailerId);
        const receiptIds = receiptRows?.map((r: any) => r.id) ?? [];

        let averageRating = 0;
        if (receiptIds.length > 0) {
            const { data: feedbackRows } = await supabase
                .from("Feedback")
                .select("rating")
                .in("receiptId", receiptIds);
            if (feedbackRows && feedbackRows.length > 0) {
                averageRating =
                    feedbackRows.reduce((sum: number, f: any) => sum + f.rating, 0) / feedbackRows.length;
            }
        }

        return NextResponse.json({
            totalReceipts: totalReceipts ?? 0,
            totalRevenue,
            repeatCustomers: repeatCustomers ?? 0,
            averageRating,
        });
    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
