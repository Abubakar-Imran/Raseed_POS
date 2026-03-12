'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Receipt, Award, LogOut, Wallet, Leaf, Menu, X, MessageSquarePlus } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase';

const queryClient = new QueryClient();

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const token = localStorage.getItem('customer_token');
        if (!token) {
            router.push('/auth/login?role=customer');
            return;
        }

        // Subscribe to Supabase Realtime for new receipt notifications
        try {
            const supabase = getSupabaseBrowserClient();
            const email = localStorage.getItem('customer_email');
            if (email) {
                const channel = supabase.channel(`customer_notifications`)
                    .on('broadcast', { event: 'newReceipt' }, (payload: any) => {
                        console.log('New Receipt Received:', payload);
                        queryClient.invalidateQueries({ queryKey: ['customer-receipts'] });
                        queryClient.invalidateQueries({ queryKey: ['customer-loyalty'] });
                        router.push('/customer/dashboard/receipts');
                    })
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            }
        } catch (err) {
            console.warn('Supabase realtime subscription failed:', err);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_email');
        router.push('/auth/login?role=customer');
    };

    const navItems = [
        { name: 'Home', href: '/customer/dashboard', icon: Home },
        { name: 'Receipts', href: '/customer/dashboard/receipts', icon: Receipt },
        { name: 'Rewards', href: '/customer/dashboard/rewards', icon: Award },
        { name: 'Sustainability', href: '/customer/dashboard/sustainability', icon: Leaf },
        { name: 'Budget', href: '/customer/dashboard/budget', icon: Wallet },
        { name: 'Feedback', href: '/customer/dashboard/feedback', icon: MessageSquarePlus },
    ];

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (!isClient) return null;

    return (
        <QueryClientProvider client={queryClient}>
            <div className="flex flex-col min-h-screen bg-slate-50">
                <header className="bg-white border-b px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center gap-5">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-green-700 tracking-tight">Raseed</h1>
                        <nav className="hidden md:flex items-center gap-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={item.name} href={item.href} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                                        <item.icon size={18} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <button
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        aria-label="Toggle navigation menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <button onClick={handleLogout} className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50">
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </header>

                {isMobileMenuOpen && (
                    <nav className="md:hidden border-b bg-white px-4 py-3 space-y-1 shadow-sm">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                                >
                                    <Icon size={18} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </nav>
                )}

                <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[72vh] p-4 sm:p-6">
                        {children}
                    </div>
                </main>
            </div>
        </QueryClientProvider>
    );
}
