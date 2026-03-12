'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt as ReceiptIcon, ChevronRight, ArrowLeft } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';

export default function CustomerStoreReceiptsPage() {
    const params = useParams();
    const retailerId = params?.retailerId as string;

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
    const storeReceipts = useMemo(() => {
        return safeReceipts.filter((receipt: any) => {
            const storeId = receipt.retailerId || receipt.retailer?.id || 'unknown-store';
            return storeId === retailerId;
        });
    }, [safeReceipts, retailerId]);

    const storeName = storeReceipts[0]?.retailer?.name || storeReceipts[0]?.Retailer?.name || 'Store Receipts';

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{storeName}</h2>
                    <p className="text-sm text-gray-500">All receipts from this store</p>
                </div>
                <Link
                    href="/customer/dashboard/receipts"
                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Stores
                </Link>
            </div>

            {isLoading ? (
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded-xl" />)}
                </div>
            ) : storeReceipts.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
                    <ReceiptIcon className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-sm font-medium text-gray-900">No receipts found for this store</h3>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {storeReceipts.map((receipt: any) => (
                        <Link key={receipt.id} href={`/customer/dashboard/receipts/${receipt.id}`}>
                            <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer group border border-gray-200 hover:border-green-300 h-full">
                                <CardContent className="p-4 flex flex-col h-full justify-between gap-3">
                                    <div className="flex items-start justify-between w-full">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-100 group-hover:text-green-700 transition-colors shadow-sm shrink-0">
                                                <ReceiptIcon size={18} className="sm:w-5 sm:h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">{receipt.billNumber}</h4>
                                                <p className="text-xs text-gray-500 font-medium wrap-break-word">{format(new Date(receipt.createdAt), 'MMM dd, yyyy • h:mm a')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-auto gap-3">
                                        <div className="flex items-center text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md">
                                            {(receipt.items?.length || receipt.ReceiptItem?.length || 0)} items
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-lg sm:text-xl text-gray-900">Rs. {(receipt.totalAmount ?? 0).toFixed(2)}</span>
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
