'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Receipt, Gift, MessageSquare, Leaf, LogOut } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RetailerDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const token = localStorage.getItem('retailer_token');
        if (!token) {
            router.push('/auth/login?role=retailer');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('retailer_token');
        localStorage.removeItem('retailer_id');
        router.push('/auth/login?role=retailer');
    };

    const navItems = [
        { name: 'Overview', href: '/retailer/dashboard', icon: LayoutDashboard },
        { name: 'Receipts', href: '/retailer/dashboard/receipts', icon: Receipt },
        { name: 'Loyalty Rules', href: '/retailer/dashboard/loyalty', icon: Gift },
        { name: 'Feedback', href: '/retailer/dashboard/feedback', icon: MessageSquare },
        { name: 'Sustainability', href: '/retailer/dashboard/sustainability', icon: Leaf },
    ];

    if (!isClient) return null;

    return (
        <QueryClientProvider client={queryClient}>
            <div className="flex h-screen bg-gray-100">
                <div className="w-64 bg-white border-r shadow-sm flex flex-col">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-gray-900">Raseed</h1>
                        <p className="text-sm text-gray-500">Retailer Portal</p>
                    </div>
                    <nav className="flex-1 px-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                                >
                                    <Icon size={20} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4 border-t">
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors">
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    <main className="p-8">{children}</main>
                </div>
            </div>
        </QueryClientProvider>
    );
}
