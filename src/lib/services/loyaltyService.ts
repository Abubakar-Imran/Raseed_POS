import { supabase } from "@/lib/supabase-server";

export const evaluateLoyaltyForCustomer = async (
    customerId: string,
    retailerId: string
) => {
    const { data: stats } = await supabase
        .from("CustomerLoyalty")
        .select("*")
        .eq("customerId", customerId)
        .eq("retailerId", retailerId)
        .single();

    if (!stats) return null;

    const { data: rules } = await supabase
        .from("LoyaltyRule")
        .select("*")
        .eq("retailerId", retailerId);

    if (!rules) return [];

    const newDiscounts = [];

    for (const rule of rules) {
        let isEligible = false;
        if (
            rule.ruleType === "RECEIPT_COUNT" &&
            stats.receiptCount % rule.threshold === 0
        ) {
            isEligible = true;
        } else if (
            rule.ruleType === "TOTAL_SPENT" &&
            stats.totalSpent >= rule.threshold
        ) {
            isEligible = true;
        }

        if (isEligible) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + rule.validDays);

            const { data: discount } = await supabase
                .from("Discount")
                .insert({
                    id: crypto.randomUUID(),
                    customerId,
                    retailerId,
                    discountPercentage: rule.discountPercentage,
                    status: "AVAILABLE",
                    expiresAt: expiresAt.toISOString(),
                })
                .select()
                .single();

            if (discount) newDiscounts.push(discount);
        }
    }

    return newDiscounts;
};
