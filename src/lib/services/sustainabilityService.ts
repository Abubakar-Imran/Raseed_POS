import { supabase } from "@/lib/supabase-server";

const ESTIMATED_CARBON_PER_RECEIPT_KG = 0.005; // 5g CO2e per receipt

const getRetailerReceiptCount = async (retailerId: string) => {
    const normalizedRetailerId = retailerId.trim();

    const { count, error: countError } = await supabase
        .from("Receipt")
        .select("id", { count: "exact", head: true })
        .eq("retailerId", normalizedRetailerId);

    if (!countError && typeof count === "number") {
        return count;
    }

    if (countError) {
        console.warn("Exact receipt count failed; falling back to row count:", countError);
    }

    const { data: receiptRows, error: rowsError } = await supabase
        .from("Receipt")
        .select("id")
        .eq("retailerId", normalizedRetailerId);

    if (rowsError) {
        console.error("Fallback receipt row count failed:", rowsError);
        return null;
    }

    return receiptRows?.length ?? 0;
};

const syncRetailerSustainabilityStats = async (retailerId: string) => {
    const normalizedRetailerId = retailerId.trim();
    const now = new Date().toISOString();
    const paperSavedCount = await getRetailerReceiptCount(normalizedRetailerId);

    if (paperSavedCount === null) {
        console.error("Failed to calculate retailer receipt count for sustainability stats");
        return null;
    }

    const estimatedCarbonSaved = paperSavedCount * ESTIMATED_CARBON_PER_RECEIPT_KG;

    const { data: existing } = await supabase
        .from("SustainabilityStats")
        .select("id")
        .eq("retailerId", normalizedRetailerId)
        .single();

    if (existing?.id) {
        const { data, error } = await supabase
            .from("SustainabilityStats")
            .update({
                paperSavedCount,
                estimatedCarbonSaved,
                updatedAt: now,
            })
            .eq("retailerId", normalizedRetailerId)
            .select()
            .single();

        if (error) {
            console.error("Failed to update sustainability stats:", error);
            return null;
        }

        return data;
    }

    const { data, error } = await supabase
        .from("SustainabilityStats")
        .insert({
            id: crypto.randomUUID(),
            retailerId: normalizedRetailerId,
            paperSavedCount,
            estimatedCarbonSaved,
            updatedAt: now,
        })
        .select()
        .single();

    if (error) {
        console.error("Failed to insert sustainability stats:", error);
        return null;
    }

    return data;
};

export const getRetailerSustainabilityStats = async (retailerId: string) => {
    if (!retailerId || retailerId === "null") return null;

    return syncRetailerSustainabilityStats(retailerId);
};

export const incrementStats = async (
    retailerId: string,
    paperCount: number = 1
) => {
    if (!retailerId || retailerId === "null") return null;
    void paperCount;

    return syncRetailerSustainabilityStats(retailerId);
};
