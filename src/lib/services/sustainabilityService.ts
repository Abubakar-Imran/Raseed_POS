import { prisma } from "@/lib/prisma";

export const getRetailerSustainabilityStats = async (retailerId: string) => {
    if (!retailerId || retailerId === "null") return null;

    let stats = await prisma.sustainabilityStats.findUnique({
        where: { retailerId },
    });

    if (!stats) {
        stats = await prisma.sustainabilityStats.create({
            data: {
                retailerId,
                paperSavedCount: 0,
                estimatedCarbonSaved: 0,
            },
        });
    }

    return stats;
};

export const incrementStats = async (
    retailerId: string,
    paperCount: number = 1
) => {
    const estimatedCarbonPerReceipt = 0.005; // 5g per receipt

    return prisma.sustainabilityStats.upsert({
        where: { retailerId },
        create: {
            retailerId,
            paperSavedCount: paperCount,
            estimatedCarbonSaved: paperCount * estimatedCarbonPerReceipt,
        },
        update: {
            paperSavedCount: { increment: paperCount },
            estimatedCarbonSaved: {
                increment: paperCount * estimatedCarbonPerReceipt,
            },
        },
    });
};
