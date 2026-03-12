'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Ticket, Store } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RewardsPage() {
    const [email, setEmail] = useState('');
    const [customerId, setCustomerId] = useState<string | null>(null);

    useEffect(() => {
        const customerEmail = localStorage.getItem('customer_email');
        if (customerEmail) setEmail(customerEmail);
    }, []);

    const { data: customerData } = useQuery({
        queryKey: ['customer', email],
        queryFn: async () => fetchWithAuth(`/customers/email/${encodeURIComponent(email)}`),
        enabled: !!email,
    });

    useEffect(() => {
        if (customerData?.id) setCustomerId(customerData.id);
    }, [customerData]);

    const { data: rewards, isLoading } = useQuery({
        queryKey: ['customer-rewards', customerId],
        queryFn: () => fetchWithAuth(`/discounts/customers/${customerId}`),
        enabled: !!customerId,
    });

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900">My Rewards</h2>
            </div>
            <p className="text-sm text-gray-500">Your available discounts from stores you shop at most.</p>
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-gray-200 shadow-sm">
                            <CardContent className="p-5 space-y-3">
                                <div className="h-6 w-24 rounded bg-gray-200" />
                                <div className="h-4 w-40 rounded bg-gray-200" />
                                <div className="h-4 w-32 rounded bg-gray-200" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : rewards?.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
                    <Gift className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-sm font-medium text-gray-900">No active rewards</h3>
                    <p className="mt-1 text-xs text-gray-500">Keep shopping at participating stores to unlock exclusive discounts.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {rewards?.map((reward: any) => (
                        <Card key={reward.id} className="border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between gap-3">
                                    <CardTitle className="text-lg font-semibold text-gray-900">{reward.discountPercentage}% OFF</CardTitle>
                                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-[#0F4716]">
                                        <Ticket className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                                    <Store size={12} /> {reward.retailer.name}
                                </div>
                                <p className="text-sm text-gray-500">Use this reward on your next checkout at this store.</p>
                                <div className="pt-2 border-t text-xs text-gray-500 font-medium">
                                    Expires {new Date(reward.expiresAt).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
