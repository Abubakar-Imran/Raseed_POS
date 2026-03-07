'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Receipt, Award, LogOut } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase';

const queryClient = new QueryClient();

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

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
    ];

    if (!isClient) return null;

    return (
        <QueryClientProvider client={queryClient}>
            <div className="flex flex-col min-h-screen bg-gray-50">
                <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center gap-8">
                        <h1 className="text-2xl font-black bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">Raseed</h1>
                        <nav className="hidden md:flex items-center gap-6">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={item.name} href={item.href} className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${isActive ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                                        <item.icon size={18} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-md hover:bg-red-50">
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </header>
                <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[70vh] p-6 sm:p-8">
                        {children}
                    </div>
                </main>
                <nav className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t flex justify-around items-center py-3 pb-safe z-50">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href} className={`flex flex-col items-center justify-center w-full space-y-1 transition-all ${isActive ? 'text-teal-600 scale-110' : 'text-gray-400 hover:text-green-500'}`}>
                                <Icon size={22} className={isActive ? "fill-teal-50" : ""} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </QueryClientProvider>
    );
}
