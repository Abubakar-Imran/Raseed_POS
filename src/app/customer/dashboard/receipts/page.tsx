'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Store, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function CustomerReceiptsPage() {
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerId, setCustomerId] = useState<string | null>(null);

    useEffect(() => {
        const email = localStorage.getItem('customer_email');
        if (email) setCustomerEmail(email);
    }, []);

    const { data: customerData } = useQuery({
        queryKey: ['customer', customerEmail],
        queryFn: async () => fetchWithAuth(`/customers/email/${encodeURIComponent(customerEmail)}`),
        enabled: !!customerEmail,
    });

    useEffect(() => {
        if (customerData?.id) setCustomerId(customerData.id);
    }, [customerData]);

    const { data: receipts, isLoading } = useQuery({
        queryKey: ['customer-receipts', customerId],
        queryFn: () => fetchWithAuth(`/receipts/customers/${customerId}`),
        enabled: !!customerId,
    });

    const safeReceipts = Array.isArray(receipts) ? receipts : [];

    const storeGroups = useMemo(() => {
        const storeMap = new Map<string, { id: string; name: string; count: number; latestAt: string }>();

        for (const receipt of safeReceipts) {
            const storeId = receipt.retailerId || receipt.retailer?.id || 'unknown-store';
            const storeName = receipt.retailer?.name || receipt.Retailer?.name || 'Store';
            const existing = storeMap.get(storeId);

            if (!existing) {
                storeMap.set(storeId, {
                    id: storeId,
                    name: storeName,
                    count: 1,
                    latestAt: receipt.createdAt,
                });
            } else {
                existing.count += 1;
                if (new Date(receipt.createdAt) > new Date(existing.latestAt)) {
                    existing.latestAt = receipt.createdAt;
                }
            }
        }

        return Array.from(storeMap.values()).sort(
            (a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime()
        );
    }, [safeReceipts]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900">My Stores</h2>
                <div className="bg-green-100 text-[#0F4716] text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap self-start sm:self-auto">
                    {storeGroups.length} Stores
                </div>
            </div>
            <p className="text-sm text-gray-500">Tap a store to view all receipts from that retailer.</p>
            {isLoading ? (
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded-xl" />)}
                </div>
            ) : safeReceipts.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
                    <Store className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-sm font-medium text-gray-900">No stores yet</h3>
                    <p className="mt-1 text-xs text-gray-500">Once you shop at a retailer, it will appear here.</p>
                </Card>
            ) : (
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Stores you shopped from</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {storeGroups.map((store) => (
                            <Link key={store.id} href={`/customer/dashboard/receipts/store/${store.id}`}>
                                <Card className="text-left p-0 border-gray-200 bg-white hover:border-green-300 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer min-h-28">
                                    <CardContent className="p-4 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 line-clamp-1">{store.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{store.count} receipt{store.count > 1 ? 's' : ''}</p>
                                            <p className="text-xs text-gray-400 mt-1">Last purchase: {format(new Date(store.latestAt), 'MMM dd, yyyy')}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                            <ChevronRight size={16} strokeWidth={3} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
