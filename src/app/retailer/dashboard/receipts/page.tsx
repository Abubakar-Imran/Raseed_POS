'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export default function RetailerReceiptsPage() {
    const [retailerId, setRetailerId] = useState<string | null>(null);

    useEffect(() => {
        setRetailerId(localStorage.getItem('retailer_id'));
    }, []);

    const { data: receipts, isLoading } = useQuery({
        queryKey: ['receipts', retailerId],
        queryFn: () => fetchWithAuth(`/receipts/retailers/${retailerId}`, {}, 'retailer'),
        enabled: !!retailerId,
    });

    if (isLoading) return <div>Loading receipts...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Receipt Management</h2>
                <p className="text-gray-500">View all digital receipts issued by your store.</p>
            </div>
            <Card>
                <CardHeader><CardTitle>Recent Receipts</CardTitle></CardHeader>
                <CardContent>
                    {receipts?.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No receipts found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Bill Number</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Customer Email</th>
                                        <th className="px-6 py-3">Total Amount</th>
                                        <th className="px-6 py-3">Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receipts?.map((receipt: any) => (
                                        <tr key={receipt.id} className="bg-white border-b">
                                            <td className="px-6 py-4 font-medium text-gray-900">{receipt.billNumber}</td>
                                            <td className="px-6 py-4">{new Date(receipt.createdAt).toLocaleString()}</td>
                                            <td className="px-6 py-4">{receipt.customer?.email || 'Unknown'}</td>
                                            <td className="px-6 py-4">Rs. {receipt.totalAmount.toFixed(2)}</td>
                                            <td className="px-6 py-4">{receipt.items.length} items</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
