import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Enable server-side Node.js APIs (bcrypt, nodemailer, etc.)
    serverExternalPackages: ["bcrypt", "nodemailer"],
};

export default nextConfig;
