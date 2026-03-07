import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { incrementStats } from "@/lib/services/sustainabilityService";
import { evaluateLoyaltyForCustomer } from "@/lib/services/loyaltyService";
import { getSupabaseServerClient } from "@/lib/supabase";

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

        let customer = await prisma.customer.findUnique({
            where: { email: customer_email },
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: { email: customer_email },
            });
        }

        const receipt = await prisma.receipt.create({
            data: {
                retailerId: retailer_id,
                branchId: branch_id,
                customerId: customer.id,
                billNumber: bill_number,
                totalAmount: total_amount,
                paymentMethod: payment_method || "CASH",
                items: {
                    create: items.map((item: any) => ({
                        itemName: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: {
                items: true,
                retailer: { select: { name: true } },
                branch: { select: { name: true } },
            },
        });

        const loyalty = await prisma.customerLoyalty.upsert({
            where: {
                customerId_retailerId: {
                    customerId: customer.id,
                    retailerId: retailer_id,
                },
            },
            create: {
                customerId: customer.id,
                retailerId: retailer_id,
                receiptCount: 1,
                totalSpent: total_amount,
            },
            update: {
                receiptCount: { increment: 1 },
                totalSpent: { increment: total_amount },
                lastVisit: new Date(),
            },
        });

        await incrementStats(retailer_id, 1);

        const discountsUnlocked = await evaluateLoyaltyForCustomer(
            customer.id,
            retailer_id
        );

        // Emit real-time notification via Supabase Realtime
        try {
            const supabase = getSupabaseServerClient();
            const channel = supabase.channel(`customer_${customer.id}`);
            await channel.send({
                type: "broadcast",
                event: "newReceipt",
                payload: { receipt, discountsUnlocked },
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
