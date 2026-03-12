'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Receipt, Gift, MessageSquare, Leaf, LogOut, UserCog, Menu, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RetailerDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const token = localStorage.getItem('retailer_token');
        if (!token) {
            router.push('/retailer-portal');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('retailer_token');
        localStorage.removeItem('retailer_id');
        router.push('/retailer-portal');
    };

    const navItems = [
        { name: 'Overview', href: '/retailer/dashboard', icon: LayoutDashboard },
        { name: 'Receipts', href: '/retailer/dashboard/receipts', icon: Receipt },
        { name: 'Loyalty Rules', href: '/retailer/dashboard/loyalty', icon: Gift },
        { name: 'Feedback', href: '/retailer/dashboard/feedback', icon: MessageSquare },
        { name: 'Sustainability', href: '/retailer/dashboard/sustainability', icon: Leaf },
        { name: 'My Profile', href: '/retailer/dashboard/profile', icon: UserCog },
    ];

    if (!isClient) return null;

    return (
        <QueryClientProvider client={queryClient}>
            <div className="flex h-screen bg-gray-100 overflow-hidden">
                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-30 w-64 bg-white border-r shadow-sm flex flex-col
                    transform transition-transform duration-200 ease-in-out
                    lg:static lg:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="flex items-center justify-between p-6">
                        <div>
                            <h1 className="text-2xl font-bold text-[#0F4716]">Raseed</h1>
                            <p className="text-sm text-gray-500">Retailer Dashboard</p>
                        </div>
                        <button
                            className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${isActive ? 'bg-[#0F4716] text-white' : 'text-gray-600 hover:bg-[#0F4716]/10 hover:text-[#0F4716]'}`}
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
                </aside>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Mobile top bar */}
                    <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b shadow-sm">
                        <button
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={22} />
                        </button>
                        <h1 className="text-lg font-bold text-[#0F4716]">Raseed</h1>
                    </header>
                    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
                </div>
            </div>
        </QueryClientProvider>
    );
}
