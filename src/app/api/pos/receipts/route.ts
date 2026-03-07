import { NextRequest, NextResponse } from "next/server";
import { supabase, getSupabaseServerClient } from "@/lib/supabase-server";
import { incrementStats } from "@/lib/services/sustainabilityService";
import { evaluateLoyaltyForCustomer } from "@/lib/services/loyaltyService";

// POST /api/pos/receipts — POS system sends a new receipt
export async function POST(request: NextRequest) {
    try {
        const {
            retailer_id,
            branch_id,
            bill_number,
            customer_email,
            total_amount,
            payment_method,
            items,
        } = await request.json();

        // Find or create customer
        const { data: existingCustomer } = await supabase
            .from("Customer")
            .select("*")
            .eq("email", customer_email)
            .single();

        let customer = existingCustomer;
        if (!customer) {
            const { data: newCustomer } = await supabase
                .from("Customer")
                .insert({ id: crypto.randomUUID(), email: customer_email })
                .select()
                .single();
            customer = newCustomer;
        }

        // Create receipt
        const { data: receipt, error: receiptError } = await supabase
            .from("Receipt")
            .insert({
                id: crypto.randomUUID(),
                retailerId: retailer_id,
                branchId: branch_id,
                customerId: customer.id,
                billNumber: bill_number,
                totalAmount: total_amount,
                paymentMethod: payment_method || "CASH",
            })
            .select("*, Retailer(name), Branch(name)")
            .single();

        if (receiptError || !receipt) {
            console.error("Receipt insert error:", receiptError);
            throw new Error("Failed to create receipt: " + receiptError?.message);
        }

        // Create receipt items
        if (items && items.length > 0) {
            await supabase.from("ReceiptItem").insert(
                items.map((item: any) => ({
                    id: crypto.randomUUID(),
                    receiptId: receipt.id,
                    itemName: item.name,
                    quantity: item.quantity,
                    price: item.price,
                }))
            );
        }

        // Fetch items for response
        const { data: receiptItems } = await supabase
            .from("ReceiptItem")
            .select("*")
            .eq("receiptId", receipt.id);

        const fullReceipt = { ...receipt, items: receiptItems ?? [] };

        // Upsert customer loyalty
        const { data: existingLoyalty } = await supabase
            .from("CustomerLoyalty")
            .select("*")
            .eq("customerId", customer.id)
            .eq("retailerId", retailer_id)
            .single();

        let loyalty;
        if (existingLoyalty) {
            const { data } = await supabase
                .from("CustomerLoyalty")
                .update({
                    receiptCount: existingLoyalty.receiptCount + 1,
                    totalSpent: existingLoyalty.totalSpent + total_amount,
                    lastVisit: new Date().toISOString(),
                })
                .eq("id", existingLoyalty.id)
                .select()
                .single();
            loyalty = data;
        } else {
            const { data } = await supabase
                .from("CustomerLoyalty")
                .insert({
                    id: crypto.randomUUID(),
                    customerId: customer.id,
                    retailerId: retailer_id,
                    receiptCount: 1,
                    totalSpent: total_amount,
                    lastVisit: new Date().toISOString(),
                })
                .select()
                .single();
            loyalty = data;
        }

        await incrementStats(retailer_id, 1);

        const discountsUnlocked = await evaluateLoyaltyForCustomer(
            customer.id,
            retailer_id
        );

        // Emit real-time notification via Supabase Realtime
        try {
            const realtimeClient = getSupabaseServerClient();
            const channel = realtimeClient.channel(`customer_${customer.id}`);
            await channel.send({
                type: "broadcast",
                event: "newReceipt",
                payload: { receipt: fullReceipt, discountsUnlocked },
            });
        } catch (realtimeErr: any) {
            console.warn("Supabase realtime broadcast failed:", realtimeErr.message);
        }

        return NextResponse.json({
            success: true,
            receiptId: receipt.id,
            loyalty_status: loyalty,
            unlocked_discounts: discountsUnlocked,
        });
    } catch (error) {
        console.error("POS Receipt Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
