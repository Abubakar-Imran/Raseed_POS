'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card } from '@/components/ui/card';
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Rewards</h2>
            </div>
            {isLoading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
                </div>
            ) : rewards?.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
                    <Gift className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-sm font-medium text-gray-900">No active rewards</h3>
                    <p className="mt-1 text-xs text-gray-500">Keep shopping at participating stores to unlock exclusive discounts.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {rewards?.map((reward: any) => (
                        <div key={reward.id} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 hover:from-green-400 to-green-700 hover:to-green-600 transition-all text-white shadow-lg hover:shadow-xl hover:-translate-y-1 p-6 lg:p-8 cursor-pointer group">
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 group-hover:scale-110 transition-transform pointer-events-none duration-500" />
                            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white opacity-10 group-hover:scale-110 transition-transform pointer-events-none duration-500" />
                            <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px]">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-4xl font-black mb-2 tracking-tight">{reward.discountPercentage}% OFF</h3>
                                        <div className="flex items-center gap-2 opacity-90 bg-black/10 w-fit px-3 py-1 rounded-full">
                                            <Store size={14} />
                                            <p className="text-sm font-semibold">{reward.retailer.name}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl shadow-inner">
                                        <Ticket className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="mt-8 pt-4 border-t border-white/20 flex justify-between items-center text-xs opacity-90 font-medium">
                                    <span>Show QR code at checkout</span>
                                    <span className="bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">Expires {new Date(reward.expiresAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
