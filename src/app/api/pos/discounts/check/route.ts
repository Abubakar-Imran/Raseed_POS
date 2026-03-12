import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

// GET /api/pos/discounts/check?customer_email=xxx&retailer_id=xxx
// POS calls this after customer provides email to check for available discounts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customer_email = searchParams.get("customer_email")?.trim().toLowerCase();
        const retailer_id = searchParams.get("retailer_id");

        if (!customer_email || !retailer_id) {
            return NextResponse.json(
                { message: "customer_email and retailer_id are required query parameters." },
                { status: 400 }
            );
        }

        // Find customer by email (same pattern as receipts webhook)
        const { data: existingCustomer, error: findCustomerError } = await supabase
            .from("Customer")
            .select("id, email, name")
            .eq("email", customer_email)
            .maybeSingle();

        if (findCustomerError) {
            console.error("POS Discount Check - customer lookup error:", findCustomerError);
            return NextResponse.json(
                { message: "Failed to resolve customer." },
                { status: 500 }
            );
        }

        let customer = existingCustomer;
        let customerCreated = false;

        // Keep POS workflow smooth: create customer if not found
        if (!customer) {
            const { data: newCustomer, error: createCustomerError } = await supabase
                .from("Customer")
                .insert({ id: crypto.randomUUID(), email: customer_email })
                .select("id, email, name")
                .single();

            if (createCustomerError || !newCustomer) {
                console.error("POS Discount Check - create customer error:", createCustomerError);
                return NextResponse.json(
                    { message: "Failed to create customer record." },
                    { status: 500 }
                );
            }

            customer = newCustomer;
            customerCreated = true;
        }

        const now = new Date().toISOString();

        const { data: discounts, error: discountsError } = await supabase
            .from("Discount")
            .select("id, discountPercentage, expiresAt, status, retailer:Retailer(name)")
            .eq("customerId", customer.id)
            .eq("retailerId", retailer_id)
            .eq("status", "AVAILABLE")
            .gt("expiresAt", now)
            .order("discountPercentage", { ascending: false });

        if (discountsError) {
            console.error("POS Discount Check - discounts query error:", discountsError);
            return NextResponse.json(
                { message: "Failed to fetch discounts." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            customer_found: true,
            customer_created: customerCreated,
            customer: {
                id: customer.id,
                email: customer.email,
            },
            has_discounts: (discounts ?? []).length > 0,
            discounts: discounts ?? [],
        });
    } catch (error) {
        console.error("POS Discount Check Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
