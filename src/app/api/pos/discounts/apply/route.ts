import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

// POST /api/pos/discounts/apply
// POS calls this when customer confirms they want to use a specific discount
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const discount_id = body?.discount_id;
        const customer_email = body?.customer_email?.trim().toLowerCase();
        const retailer_id = body?.retailer_id;

        if (!discount_id || !customer_email || !retailer_id) {
            return NextResponse.json(
                { message: "discount_id, customer_email, and retailer_id are required." },
                { status: 400 }
            );
        }

        // Verify customer exists
        const { data: customer, error: customerError } = await supabase
            .from("Customer")
            .select("id, email")
            .eq("email", customer_email)
            .maybeSingle();

        if (customerError) {
            console.error("POS Discount Apply - customer lookup error:", customerError);
            return NextResponse.json(
                { message: "Failed to resolve customer.", applied: false },
                { status: 500 }
            );
        }

        if (!customer) {
            return NextResponse.json(
                { message: "Customer not found.", applied: false },
                { status: 404 }
            );
        }

        const now = new Date().toISOString();

        // Fetch the discount and validate ownership + status
        const { data: discount, error: discountLookupError } = await supabase
            .from("Discount")
            .select("*")
            .eq("id", discount_id)
            .eq("customerId", customer.id)
            .eq("retailerId", retailer_id)
            .eq("status", "AVAILABLE")
            .gt("expiresAt", now)
            .maybeSingle();

        if (discountLookupError) {
            console.error("POS Discount Apply - discount lookup error:", discountLookupError);
            return NextResponse.json(
                { message: "Failed to validate discount.", applied: false },
                { status: 500 }
            );
        }

        if (!discount) {
            return NextResponse.json(
                {
                    message: "Discount not found, already used, expired, or does not belong to this customer.",
                    applied: false,
                },
                { status: 404 }
            );
        }

        // Mark the discount as USED — removes it from customer's active rewards
        const { data: updated, error } = await supabase
            .from("Discount")
            .update({ status: "USED" })
            .eq("id", discount_id)
            .select()
            .single();

        if (error || !updated) {
            console.error("Failed to apply discount:", error);
            return NextResponse.json(
                { message: "Failed to apply discount. Please try again.", applied: false },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            applied: true,
            discount_percentage: discount.discountPercentage,
            message: `${discount.discountPercentage}% discount successfully applied and removed from customer rewards.`,
            discount: {
                id: updated.id,
                discountPercentage: updated.discountPercentage,
                status: updated.status,
            },
            customer: {
                id: customer.id,
                email: customer.email,
            },
        });
    } catch (error) {
        console.error("POS Discount Apply Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
