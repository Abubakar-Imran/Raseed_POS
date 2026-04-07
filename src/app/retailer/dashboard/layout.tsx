'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
            <div className="flex h-screen overflow-hidden bg-background text-foreground">
                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-card shadow-sm
                    transform transition-transform duration-200 ease-in-out
                    lg:static lg:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/raseed_logo3.png"
                                alt="Raseed logo"
                                width={20}
                                height={20}
                                className="h-10 w-10 rounded-md object-contain"
                                priority
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-primary"><a href="/retailer/dashboard">Raseed</a></h1>
                                <p className="text-sm text-muted-foreground">Retailer Dashboard</p>
                            </div>
                        </div>
                        <button
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
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
                                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                                >
                                    <Icon size={20} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="border-t border-border p-4">
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600">
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Mobile top bar */}
                    <header className="flex items-center gap-4 border-b border-border bg-card px-4 py-3 shadow-sm lg:hidden">
                        <button
                            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={22} />
                        </button>
                        <Image
                            src="/raseed_logo3.png"
                            alt="Raseed logo"
                            width={28}
                            height={28}
                            className="h-7 w-7 rounded-md object-contain"
                            priority
                        />
                        <h1 className="text-lg font-bold text-primary"><a href="/retailer/dashboard">Raseed</a></h1>
                    </header>
                    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
                </div>
            </div>
        </QueryClientProvider>
    );
}
