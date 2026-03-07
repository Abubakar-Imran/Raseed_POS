import { supabase } from "@/lib/supabase-server";

export const getRetailerSustainabilityStats = async (retailerId: string) => {
    if (!retailerId || retailerId === "null") return null;

    const { data: stats } = await supabase
        .from("SustainabilityStats")
        .select("*")
        .eq("retailerId", retailerId)
        .single();

    if (stats) return stats;

    const { data: newStats } = await supabase
        .from("SustainabilityStats")
        .insert({
            id: crypto.randomUUID(),
            retailerId,
            paperSavedCount: 0,
            estimatedCarbonSaved: 0,
        })
        .select()
        .single();

    return newStats;
};

export const incrementStats = async (
    retailerId: string,
    paperCount: number = 1
) => {
    const estimatedCarbonPerReceipt = 0.005; // 5g per receipt

    const { data: existing } = await supabase
        .from("SustainabilityStats")
        .select("*")
        .eq("retailerId", retailerId)
        .single();

    if (existing) {
        const { data } = await supabase
            .from("SustainabilityStats")
            .update({
                paperSavedCount: existing.paperSavedCount + paperCount,
                estimatedCarbonSaved:
                    existing.estimatedCarbonSaved + paperCount * estimatedCarbonPerReceipt,
            })
            .eq("retailerId", retailerId)
            .select()
            .single();
        return data;
    } else {
        const { data } = await supabase
            .from("SustainabilityStats")
            .insert({
                id: crypto.randomUUID(),
                retailerId,
                paperSavedCount: paperCount,
                estimatedCarbonSaved: paperCount * estimatedCarbonPerReceipt,
            })
            .select()
            .single();
        return data;
    }
};
