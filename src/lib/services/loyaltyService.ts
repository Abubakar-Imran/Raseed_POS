import { prisma } from "@/lib/prisma";

export const evaluateLoyaltyForCustomer = async (
    customerId: string,
    retailerId: string
) => {
    const stats = await prisma.customerLoyalty.findUnique({
        where: { customerId_retailerId: { customerId, retailerId } },
    });

    if (!stats) return null;

    const rules = await prisma.loyaltyRule.findMany({
        where: { retailerId },
    });

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

            const discount = await prisma.discount.create({
                data: {
                    customerId,
                    retailerId,
                    discountPercentage: rule.discountPercentage,
                    status: "AVAILABLE",
                    expiresAt,
                },
            });
            newDiscounts.push(discount);
        }
    }

    return newDiscounts;
};
