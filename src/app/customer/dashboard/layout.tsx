'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Receipt, Award, LogOut, Wallet, Leaf, Menu, X, MessageSquarePlus } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import Image from 'next/image';

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
        // { name: 'Budget', href: '/customer/dashboard/budget', icon: Wallet },
        { name: 'Feedback', href: '/customer/dashboard/feedback', icon: MessageSquarePlus },
    ];

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (!isClient) return null;

    return (
        <QueryClientProvider client={queryClient}>
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
                    <div className="flex items-center gap-5">
                        <Image
                        src="/raseed_logo3.png"
                        alt="Raseed logo"
                        width={20}
                        height={20}
                        className="h-10 w-10 rounded-md object-contain"
                        priority
                    />
                        <h1 className="text-xl font-extrabold tracking-tight text-primary sm:text-2xl"><a href="/customer/dashboard">Raseed</a></h1>
                        <nav className="hidden md:flex items-center gap-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={item.name} href={item.href} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                                        <item.icon size={18} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <button
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
                        aria-label="Toggle navigation menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <button onClick={handleLogout} className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 md:flex">
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </header>

                {isMobileMenuOpen && (
                    <nav className="space-y-1 border-b border-border bg-card px-4 py-3 shadow-sm md:hidden">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                >
                                    <Icon size={18} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </nav>
                )}

                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-6 sm:px-6">
                    <div className="min-h-[72vh] rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                        {children}
                    </div>
                </main>
            </div>
        </QueryClientProvider>
    );
}
