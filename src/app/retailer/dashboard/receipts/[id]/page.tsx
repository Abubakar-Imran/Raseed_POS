'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function RetailerReceiptDetailPage() {
    const params = useParams();
    const receiptId = params?.id as string;

    const { data: receipt, isLoading } = useQuery({
        queryKey: ['retailer-receipt-detail', receiptId],
        queryFn: () => fetchWithAuth(`/receipts/${receiptId}`, {}, 'retailer'),
        enabled: !!receiptId,
    });

    if (isLoading) return <div className="text-gray-500">Loading receipt details...</div>;
    if (!receipt) return <div className="text-red-500">Receipt not found.</div>;

    const items = Array.isArray(receipt.items)
        ? receipt.items
        : Array.isArray(receipt.ReceiptItem)
            ? receipt.ReceiptItem
            : [];

    const customerEmail = receipt.customer?.email || receipt.Customer?.email || 'Unknown';
    const customerName = receipt.customer?.name || receipt.Customer?.name || 'N/A';
    const branchName = receipt.branch?.name || receipt.Branch?.name || 'Main Branch';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Receipt Detail</h2>
                    <p className="text-gray-500">Complete receipt information for auditing and support.</p>
                </div>
                <Link
                    href="/retailer/dashboard/receipts"
                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Receipts
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Bill Number</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold">{receipt.billNumber}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Issued To</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-sm font-semibold text-gray-900">{customerEmail}</div>
                        <div className="text-xs text-gray-500 mt-1">{customerName}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Branch</CardTitle></CardHeader>
                    <CardContent><div className="text-base font-semibold">{branchName}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Amount</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">Rs. {(receipt.totalAmount ?? 0).toFixed(2)}</div></CardContent>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Purchased Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {items.length === 0 ? (
                            <p className="text-sm text-gray-500">No item lines found for this receipt.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-600">
                                    <thead className="text-xs uppercase text-gray-700 bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2">Item</th>
                                            <th className="px-4 py-2">Qty</th>
                                            <th className="px-4 py-2">Unit Price</th>
                                            <th className="px-4 py-2">Line Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item: any) => (
                                            <tr key={item.id} className="border-b">
                                                <td className="px-4 py-3 font-medium text-gray-900">{item.itemName}</td>
                                                <td className="px-4 py-3">{item.quantity}</td>
                                                <td className="px-4 py-3">Rs. {(item.price ?? 0).toFixed(2)}</td>
                                                <td className="px-4 py-3 font-semibold">Rs. {((item.quantity ?? 0) * (item.price ?? 0)).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Receipt Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <p className="text-gray-500">Receipt ID</p>
                            <p className="font-mono text-xs break-all">{receipt.id}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Customer ID</p>
                            <p className="font-mono text-xs break-all">{receipt.customerId || '-'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Issued At</p>
                            <p className="font-medium">{new Date(receipt.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Payment Method</p>
                            <p className="font-medium">{receipt.paymentMethod || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Item Count</p>
                            <p className="font-medium">{items.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
