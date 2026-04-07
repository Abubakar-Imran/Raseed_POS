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

    const safeRewards = Array.isArray(rewards) ? rewards : [];

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">My Rewards</h2>
            </div>
            <p className="text-sm text-muted-foreground">Your available discounts from stores you shop at most.</p>
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-border shadow-sm">
                            <CardContent className="p-5 space-y-3">
                                <div className="h-6 w-24 rounded bg-muted" />
                                <div className="h-4 w-40 rounded bg-muted" />
                                <div className="h-4 w-32 rounded bg-muted" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : safeRewards.length === 0 ? (
                <Card className="flex flex-col items-center justify-center border-2 border-dashed border-border bg-muted/40 p-8 text-center">
                    <Gift className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">No active rewards</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Keep shopping at participating stores to unlock exclusive discounts.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {safeRewards.map((reward: any) => {
                        const retailerName = reward.retailer?.name || reward.Retailer?.name || 'Store';

                        return (
                        <Card key={reward.id} className="border-border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between gap-3">
                                    <CardTitle className="text-lg font-semibold text-foreground">{Number(reward.discountPercentage ?? 0)}% OFF</CardTitle>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                                        <Ticket className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                                    <Store size={12} /> {retailerName}
                                </div>
                                <p className="text-sm text-muted-foreground">Use this reward on your next checkout at this store.</p>
                                <div className="border-t pt-2 text-xs font-medium text-muted-foreground">
                                    Expires {new Date(reward.expiresAt).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    );})}
                </div>
            )}
        </div>
    );
}
