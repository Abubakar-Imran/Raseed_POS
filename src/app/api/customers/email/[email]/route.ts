import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/customers/email/[email] — Get customer by email
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const { email } = await params;
        const decodedEmail = decodeURIComponent(email);

        const customer = await prisma.customer.findUnique({
            where: { email: decodedEmail },
            include: {
                receipts: true,
                customerLoyalty: true,
                discounts: true,
            },
        });

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
