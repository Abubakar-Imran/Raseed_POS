'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Receipt, Award, Leaf, ArrowRight, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CustomerDashboardHome() {
    const [email, setEmail] = useState('');
    const [customerId, setCustomerId] = useState<string | null>(null);

    useEffect(() => {
        const storedEmail = localStorage.getItem('customer_email');
        if (storedEmail) setEmail(storedEmail);
    }, []);

    const { data: customerData } = useQuery({
        queryKey: ['customer', email],
        queryFn: async () => fetchWithAuth(`/customers/email/${encodeURIComponent(email)}`),
        enabled: !!email,
    });

    useEffect(() => {
        if (customerData?.id) setCustomerId(customerData.id);
    }, [customerData]);

    const { data: receipts } = useQuery({
        queryKey: ['customer-receipts', customerId],
        queryFn: () => fetchWithAuth(`/receipts/customers/${customerId}`),
        enabled: !!customerId,
    });

    const { data: rewards } = useQuery({
        queryKey: ['customer-rewards', customerId],
        queryFn: () => fetchWithAuth(`/discounts/customers/${customerId}`),
        enabled: !!customerId,
    });

    const safeReceipts = Array.isArray(receipts) ? receipts : [];
    const recentPurchases = [...safeReceipts]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSpend = safeReceipts
        .filter((receipt: any) => new Date(receipt.createdAt) >= startOfMonth)
        .reduce((sum: number, receipt: any) => sum + (receipt.totalAmount ?? 0), 0);

    const retailerCount = new Set(
        safeReceipts.map((receipt: any) => receipt.retailerId || receipt.retailer?.id).filter(Boolean)
    ).size;

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                    {/* Welcome back{customerData?.name ? `, ${customerData.name}` : '!'} */}
                    {/* display customer name if available otherwise just welcome back! and display its email to get identified */}
                    Welcome Back{customerData?.name ? `, ${customerData.name}` : '!'} {customerData?.name ? '' : `(${email})`}
                </h2>
                <Link href="/customer/dashboard/receipts" className="inline-flex shrink-0 items-center self-start text-sm font-medium text-primary hover:underline">
                    All Receipts <ArrowRight size={14} className="ml-1" />
                </Link>
            </div>
            <p className="text-sm text-muted-foreground">Here&apos;s your spending and rewards overview at a glance.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <Card className="border-border bg-linear-to-br from-secondary to-card shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium text-primary flex items-center gap-2">
                            <Receipt size={16} /> Total Receipts
                        </CardTitle>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-primary">{safeReceipts.length}</div></CardContent>
                </Card>

                <Card className="border-border bg-linear-to-br from-secondary to-card shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium text-primary flex items-center gap-2">
                            <Wallet size={16} /> This Month Spend
                        </CardTitle>
                    </CardHeader>
                    <CardContent><div className="text-xl sm:text-2xl font-black text-primary wrap-break-word">Rs. {monthSpend.toFixed(2)}</div></CardContent>
                </Card>

                <Card className="border-border bg-linear-to-br from-accent to-card shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
                            <Award size={16} /> Active Rewards
                        </CardTitle>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-foreground">{Array.isArray(rewards) ? rewards.length : 0}</div></CardContent>
                </Card>

                <Card className="border-border bg-linear-to-br from-secondary to-card shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium text-primary flex items-center gap-2">
                            <Leaf size={16} /> Trees Saved
                        </CardTitle>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-primary">{(safeReceipts.length * 0.01).toFixed(2)}</div></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                <Card className="xl:col-span-2 border-border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-foreground">Last 3 Purchases</CardTitle>
                        <CardDescription>Most recent purchases from your receipt history</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {recentPurchases.length > 0 ? (
                            recentPurchases.map((receipt: any) => (
                                <div key={receipt.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-foreground">{receipt.retailer?.name || 'Retailer'}</p>
                                        <p className="wrap-break-word text-xs text-muted-foreground">{new Date(receipt.createdAt).toLocaleDateString()} • {receipt.items?.length || 0} item{(receipt.items?.length || 0) === 1 ? '' : 's'}</p>
                                    </div>
                                    <p className="shrink-0 self-start text-sm font-semibold text-foreground sm:self-auto">Rs. {(receipt.totalAmount ?? 0).toFixed(2)}</p>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-lg border border-dashed border-border p-5 text-center">
                                <p className="text-sm text-muted-foreground">No purchases yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    {/* <Card className="border-border bg-linear-to-r from-secondary to-accent/40 shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm font-semibold text-primary">You shop with {retailerCount} store{retailerCount === 1 ? '' : 's'}</p>
                            <p className="mt-1 text-xs text-primary/70">Track your limits and spending from the Budget tab.</p>
                            <Link href="/customer/dashboard/budget" className="mt-3 inline-flex rounded-sm px-1 py-0.5 text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 hover:text-[#0a3310]">
                                Open Budget Tracker
                            </Link>
                        </CardContent>
                    </Card> */}

                    <div className="grid grid-cols-1 gap-3">
                        <Link href="/customer/dashboard/rewards">
                            <Card className="cursor-pointer border-border shadow-sm transition-all duration-200 hover:bg-muted hover:shadow-md active:scale-[0.99]">
                                <CardContent className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="rounded-lg bg-secondary p-2 text-primary"><Award size={18} /></div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground">Loyalty Rewards</h4>
                                            <p className="text-xs text-muted-foreground">Check your discounts</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-muted-foreground" />
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/customer/dashboard/sustainability">
                            <Card className="cursor-pointer border-border shadow-sm transition-all duration-200 hover:bg-muted hover:shadow-md active:scale-[0.99]">
                                <CardContent className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="rounded-lg bg-secondary p-2 text-primary"><Leaf size={18} /></div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground">Sustainability Impact</h4>
                                            <p className="text-xs text-muted-foreground">See your contribution</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-muted-foreground" />
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
