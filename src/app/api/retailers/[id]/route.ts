import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

// GET /api/retailers/[id] — Get retailer by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { data: retailer } = await supabase
            .from("Retailer")
            .select("id, name, email, createdAt")
            .eq("id", id)
            .single();

        if (!retailer) {
            return NextResponse.json(
                { message: "Retailer not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(retailer);
    } catch (error) {
        console.error("Get Retailer Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
