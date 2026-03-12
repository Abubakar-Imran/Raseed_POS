'use client';

import { useQuery } from '@tanstack/react-query';
import { API_BASE, fetchWithAuth } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, DollarSign, Users, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function RetailerDashboardOverview() {
    const [retailerId, setRetailerId] = useState<string | null>(null);

    useEffect(() => {
        setRetailerId(localStorage.getItem('retailer_id'));
    }, []);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['analytics', retailerId],
        queryFn: () => fetchWithAuth(`/analytics/retailers/${retailerId}`, {}, 'retailer'),
        enabled: !!retailerId,
    });

    const { data: retailer } = useQuery({
        queryKey: ['retailer-profile', retailerId],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/retailers/${retailerId}`);
            if (!res.ok) throw new Error('Failed to load retailer profile');
            return res.json();
        },
        enabled: !!retailerId,
    });

    const { data: receipts } = useQuery({
        queryKey: ['overview-receipts', retailerId],
        queryFn: () => fetchWithAuth(`/receipts/retailers/${retailerId}`, {}, 'retailer'),
        enabled: !!retailerId,
    });

    if (!retailerId || isLoading) return <div>Loading dashboard...</div>;

    const kpis = [
        { title: 'Total Receipts Issued', value: stats?.totalReceipts || 0, icon: Receipt, description: 'Paperless receipts sent' },
        { title: 'Total Revenue', value: `Rs. ${(stats?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, description: 'Acquired via POS checkout' },
        { title: 'Repeat Customers', value: stats?.repeatCustomers || 0, icon: Users, description: 'Customers with >1 visits' },
        { title: 'Average Rating', value: (stats?.averageRating || 0).toFixed(1) + ' / 5.0', icon: Star, description: 'From receipt feedback' },
    ];

    const safeReceipts = Array.isArray(receipts) ? receipts : [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const receiptsToday = safeReceipts.filter((r: any) => new Date(r.createdAt) >= startOfToday);
    const revenueToday = receiptsToday.reduce((sum: number, r: any) => sum + (r.totalAmount ?? 0), 0);
    const uniqueCustomersToday = new Set(receiptsToday.map((r: any) => r.customerId).filter(Boolean)).size;

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    const current7dReceipts = safeReceipts.filter((r: any) => {
        const d = new Date(r.createdAt);
        return d >= sevenDaysAgo;
    });
    const prev7dReceipts = safeReceipts.filter((r: any) => {
        const d = new Date(r.createdAt);
        return d >= fourteenDaysAgo && d < sevenDaysAgo;
    });

    const current7dRevenue = current7dReceipts.reduce((sum: number, r: any) => sum + (r.totalAmount ?? 0), 0);
    const prev7dRevenue = prev7dReceipts.reduce((sum: number, r: any) => sum + (r.totalAmount ?? 0), 0);
    const trendDelta = current7dRevenue - prev7dRevenue;
    const trendDirection = trendDelta >= 0 ? 'up' : 'down';

    const recentReceipts = safeReceipts.slice(0, 3);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Overview - {retailer?.name || 'Your Shop'}</h2>
                <p className="text-gray-500">View your overall store performance and metrics.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <Card key={kpi.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                <Icon className="h-4 w-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Receipts Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{receiptsToday.length}</div>
                        <p className="text-xs text-gray-500 mt-1">Issued since midnight</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rs. {revenueToday.toFixed(2)}</div>
                        <p className="text-xs text-gray-500 mt-1">Today&apos;s sales total</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Unique Customers Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueCustomersToday}</div>
                        <p className="text-xs text-gray-500 mt-1">Distinct customers served</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <Card className="xl:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            7-Day Revenue Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-xl font-bold">Rs. {current7dRevenue.toFixed(2)}</div>
                        <p className="text-sm text-gray-500">Current 7 days</p>
                        <p className={`text-sm font-semibold ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {trendDirection === 'up' ? '+' : ''}Rs. {trendDelta.toFixed(2)} vs previous 7 days
                        </p>
                        <p className="text-xs text-gray-500">Previous 7-day revenue: Rs. {prev7dRevenue.toFixed(2)}</p>
                    </CardContent>
                </Card>

                <Card className="xl:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base">Recent Receipts</CardTitle>
                        <Link href="/retailer/dashboard/receipts" className="text-xs font-semibold text-gray-600 hover:text-gray-900">
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentReceipts.length === 0 ? (
                            <p className="text-sm text-gray-500">No recent receipts yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentReceipts.map((receipt: any) => (
                                    <div key={receipt.id} className="flex items-center justify-between gap-3 p-3 rounded-md border">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{receipt.billNumber}</p>
                                            <p className="text-xs text-gray-500 truncate">{receipt.customer?.email || receipt.Customer?.email || 'Unknown customer'}</p>
                                        </div>
                                        <div className="text-right whitespace-nowrap">
                                            <p className="text-sm font-bold text-gray-900">Rs. {(receipt.totalAmount ?? 0).toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">{new Date(receipt.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
