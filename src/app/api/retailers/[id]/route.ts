import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import bcrypt from "bcrypt";

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

// PATCH /api/retailers/[id] — Update retailer name and/or password
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { name, currentPassword, newPassword } = await request.json();

        // Fetch current retailer including passwordHash
        const { data: retailer } = await supabase
            .from("Retailer")
            .select("id, name, email, passwordHash")
            .eq("id", id)
            .single();

        if (!retailer) {
            return NextResponse.json(
                { message: "Retailer not found" },
                { status: 404 }
            );
        }

        // Always require current password to authorize changes
        const passwordMatch = await bcrypt.compare(currentPassword, retailer.passwordHash);
        if (!passwordMatch) {
            return NextResponse.json(
                { message: "Current password is incorrect." },
                { status: 401 }
            );
        }

        const updates: Record<string, string> = {};

        if (name && name.trim() !== "") {
            updates.name = name.trim();
        }

        if (newPassword) {
            if (newPassword.length < 6) {
                return NextResponse.json(
                    { message: "New password must be at least 6 characters." },
                    { status: 400 }
                );
            }
            updates.passwordHash = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { message: "No changes provided." },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("Retailer")
            .update(updates)
            .eq("id", id);

        if (error) {
            console.error("Update Retailer Error:", error);
            return NextResponse.json(
                { message: "Failed to update profile." },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Profile updated successfully." });
    } catch (error) {
        console.error("Patch Retailer Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
