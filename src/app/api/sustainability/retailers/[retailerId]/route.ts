import { NextRequest, NextResponse } from "next/server";
import { getRetailerSustainabilityStats } from "@/lib/services/sustainabilityService";

// GET /api/sustainability/retailers/[retailerId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ retailerId: string }> }
) {
    try {
        const { retailerId } = await params;
        const stats = await getRetailerSustainabilityStats(retailerId);

        if (!stats) {
            return NextResponse.json(
                { message: "Invalid Retailer ID" },
                { status: 400 }
            );
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Get Sustainability Stats Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
