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
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
                    Welcome back{customerData?.name ? `, ${customerData.name}` : '!'}
                </h2>
                <Link href="/customer/dashboard/receipts" className="text-sm text-green-700 font-medium hover:underline inline-flex items-center shrink-0 self-start">
                    All Receipts <ArrowRight size={14} className="ml-1" />
                </Link>
            </div>
            <p className="text-gray-500 text-sm">Here&apos;s your spending and rewards overview at a glance.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <Card className="border-emerald-200 bg-linear-to-br from-emerald-50 to-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium text-emerald-800 flex items-center gap-2">
                            <Receipt size={16} /> Total Receipts
                        </CardTitle>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-emerald-700">{safeReceipts.length}</div></CardContent>
                </Card>

                <Card className="border-teal-200 bg-linear-to-br from-teal-50 to-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium text-teal-800 flex items-center gap-2">
                            <Wallet size={16} /> This Month Spend
                        </CardTitle>
                    </CardHeader>
                    <CardContent><div className="text-xl sm:text-2xl font-black text-teal-700 wrap-break-word">Rs. {monthSpend.toFixed(2)}</div></CardContent>
                </Card>

                <Card className="border-violet-200 bg-linear-to-br from-violet-50 to-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium text-violet-800 flex items-center gap-2">
                            <Award size={16} /> Active Rewards
                        </CardTitle>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-violet-700">{Array.isArray(rewards) ? rewards.length : 0}</div></CardContent>
                </Card>

                <Card className="border-green-200 bg-linear-to-br from-green-50 to-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium text-green-800 flex items-center gap-2">
                            <Leaf size={16} /> Trees Saved
                        </CardTitle>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-green-700">{(safeReceipts.length * 0.01).toFixed(2)}</div></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                <Card className="xl:col-span-2 shadow-sm border-gray-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Last 3 Purchases</CardTitle>
                        <CardDescription>Most recent purchases from your receipt history</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {recentPurchases.length > 0 ? (
                            recentPurchases.map((receipt: any) => (
                                <div key={receipt.id} className="rounded-lg border border-gray-200 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 transition-colors hover:bg-gray-50">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{receipt.retailer?.name || 'Retailer'}</p>
                                        <p className="text-xs text-gray-500 wrap-break-word">{new Date(receipt.createdAt).toLocaleDateString()} • {receipt.items?.length || 0} item{(receipt.items?.length || 0) === 1 ? '' : 's'}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 self-start sm:self-auto shrink-0">Rs. {(receipt.totalAmount ?? 0).toFixed(2)}</p>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-lg border border-dashed border-gray-300 p-5 text-center">
                                <p className="text-sm text-gray-500">No purchases yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    <Card className="border-cyan-200 bg-linear-to-r from-cyan-50 to-sky-50 shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm font-semibold text-cyan-900">You shop with {retailerCount} store{retailerCount === 1 ? '' : 's'}</p>
                            <p className="text-xs text-cyan-700 mt-1">Track your limits and spending from the Budget tab.</p>
                            <Link href="/customer/dashboard/budget" className="inline-flex mt-3 text-sm font-semibold text-cyan-700 hover:text-cyan-900 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 rounded-sm">
                                Open Budget Tracker
                            </Link>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-3">
                        <Link href="/customer/dashboard/rewards">
                            <Card className="hover:bg-gray-50 transition-all duration-200 shadow-sm cursor-pointer border-green-100/50 hover:shadow-md active:scale-[0.99]">
                                <CardContent className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><Award size={18} /></div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm">Loyalty Rewards</h4>
                                            <p className="text-xs text-gray-500">Check your discounts</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/customer/dashboard/sustainability">
                            <Card className="hover:bg-gray-50 transition-all duration-200 shadow-sm cursor-pointer border-green-100/50 hover:shadow-md active:scale-[0.99]">
                                <CardContent className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-green-100 rounded-lg text-green-600"><Leaf size={18} /></div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm">Sustainability Impact</h4>
                                            <p className="text-xs text-gray-500">See your contribution</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
