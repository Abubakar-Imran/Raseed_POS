'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, DollarSign, Users, Star } from 'lucide-react';
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

    if (!retailerId || isLoading) return <div>Loading dashboard...</div>;

    const kpis = [
        { title: 'Total Receipts Issued', value: stats?.totalReceipts || 0, icon: Receipt, description: 'Paperless receipts sent' },
        { title: 'Total Revenue', value: `Rs. ${(stats?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, description: 'Acquired via POS checkout' },
        { title: 'Repeat Customers', value: stats?.repeatCustomers || 0, icon: Users, description: 'Customers with >1 visits' },
        { title: 'Average Rating', value: (stats?.averageRating || 0).toFixed(1) + ' / 5.0', icon: Star, description: 'From receipt feedback' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
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
        </div>
    );
}
