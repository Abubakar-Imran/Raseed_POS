'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt as ReceiptIcon, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Receipts</h2>
                <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                    {receipts?.length || 0} Total
                </div>
            </div>
            {isLoading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
                </div>
            ) : receipts?.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
                    <ReceiptIcon className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-sm font-medium text-gray-900">No receipts yet</h3>
                    <p className="mt-1 text-xs text-gray-500">Make a purchase at a participating retailer to see your digital receipt here.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {receipts?.map((receipt: any) => (
                        <Link key={receipt.id} href={`/customer/dashboard/receipts/${receipt.id}`}>
                            <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group border border-gray-100 hover:border-green-300 h-full">
                                <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                                    <div className="flex items-start justify-between w-full">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-100 group-hover:text-green-700 transition-colors shadow-sm">
                                                <ReceiptIcon size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg line-clamp-1">{receipt.retailer?.name || 'Store'}</h4>
                                                <p className="text-xs text-gray-500 font-medium">{format(new Date(receipt.createdAt), 'MMM dd, yyyy • h:mm a')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between border-t border-gray-50 pt-3 mt-auto">
                                        <div className="flex items-center text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md">
                                            {receipt.items?.length || 0} items
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-xl text-gray-900">Rs. {receipt.totalAmount.toFixed(2)}</span>
                                            <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                                                <ChevronRight size={14} strokeWidth={3} />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
