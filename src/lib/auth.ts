import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export interface JwtPayload {
    sub: string;
    email: string;
    role: "customer" | "retailer";
}

/**
 * Sign a JWT token for a user
 */
export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET);
}

/**
 * Verify a JWT token from the Authorization header.
 * Returns the decoded payload or null if invalid.
 */
export function verifyToken(request: NextRequest): JwtPayload | null {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Helper to return a 401 Unauthorized response
 */
export function unauthorizedResponse() {
    return NextResponse.json(
        { message: "Missing or invalid authorization" },
        { status: 401 }
    );
}
