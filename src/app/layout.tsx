import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Raseed - Digital Receipt Platform',
    description: 'POS-integrated digital receipts, loyalty rewards, and sustainability tracking',
    themeColor: '#0F4716',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning>{children}</body>
        </html>
    );
}
