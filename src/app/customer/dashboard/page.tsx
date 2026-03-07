'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Receipt, Award, Leaf, ArrowRight } from 'lucide-react';
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

    const recentReceipt = receipts && receipts.length > 0 ? receipts[0] : null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-green-900">
                    Welcome back{customerData?.name ? `, ${customerData.name}` : '!'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">Here's a quick overview of your digital receipts.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <Receipt size={16} /> Total Receipts
                        </CardTitle>
                    </CardHeader>
                    <CardContent><div className="text-3xl font-black text-green-700">{receipts?.length || 0}</div></CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-teal-800 flex items-center gap-2">
                            <Leaf size={16} /> Trees Saved
                        </CardTitle>
                    </CardHeader>
                    <CardContent><div className="text-3xl font-black text-teal-700">{((receipts?.length || 0) * 0.01).toFixed(2)}</div></CardContent>
                </Card>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Latest Purchase</h3>
                    <Link href="/customer/dashboard/receipts" className="text-sm text-green-600 font-medium hover:underline flex items-center">
                        View All <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>
                {recentReceipt ? (
                    <Card className="shadow-md border-gray-100 overflow-hidden">
                        <div className="h-2 w-full bg-green-500"></div>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{recentReceipt.retailer?.name || 'Retailer'}</CardTitle>
                                    <CardDescription>{new Date(recentReceipt.createdAt).toLocaleDateString()}</CardDescription>
                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <span className="font-semibold text-gray-900">Rs. {recentReceipt.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">{recentReceipt.items?.length || 0} items purchased</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-dashed border-2 py-8 text-center bg-gray-50">
                        <CardContent>
                            <Receipt className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">No receipts yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Your first purchase will appear here.</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="space-y-3">
                <Link href="/customer/dashboard/rewards">
                    <Card className="hover:bg-gray-50 transition-colors shadow-sm cursor-pointer border-green-100/50">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><Award size={20} /></div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">Loyalty Rewards</h4>
                                    <p className="text-xs text-gray-500">Check your available discounts</p>
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-gray-400" />
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/customer/dashboard/sustainability">
                    <Card className="hover:bg-gray-50 transition-colors shadow-sm cursor-pointer border-green-100/50">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600"><Leaf size={20} /></div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">Sustainability Impact</h4>
                                    <p className="text-xs text-gray-500">See your environmental contribution</p>
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-gray-400" />
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
