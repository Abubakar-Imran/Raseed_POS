import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

// GET /api/customers/email/[email] — Get customer by email
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const { email } = await params;
        const decodedEmail = decodeURIComponent(email);

        const { data: customer } = await supabase
            .from("Customer")
            .select("*, Receipt(*), CustomerLoyalty(*), Discount(*)")
            .eq("email", decodedEmail)
            .single();

        if (!customer) {
            return NextResponse.json(
                { message: "Customer not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error("Get Customer Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
