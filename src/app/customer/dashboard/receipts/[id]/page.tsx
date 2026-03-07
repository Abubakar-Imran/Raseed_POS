'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Ticket, Store, Leaf, HandCoins } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export default function ReceiptDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [receipt, setReceipt] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReceipt = async () => {
            if (!params.id) return;
            try {
                const res = await fetch(`${API_BASE}/receipts/${params.id}`);
                const data = await res.json();
                if (res.ok) setReceipt(data);
            } catch (error) {
                console.error("Failed to fetch receipt:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReceipt();
    }, [params.id]);

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading receipt details...</div>;

    if (!receipt) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Receipt Not Found</h2>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <Button variant="ghost" className="mb-2" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4 text-gray-600" />
                <span className="text-gray-600 font-medium">Back to Receipts</span>
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card className="border border-gray-200 shadow-xl rounded-xl overflow-hidden bg-white">
                        <div className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200 border-dashed p-6 text-center">
                            <Store className="h-10 w-10 mx-auto text-blue-600 mb-3" />
                            <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">{receipt.retailer?.name || 'Raseed Partner'}</CardTitle>
                            <div className="text-sm text-gray-500 mt-2 font-medium">{receipt.branch?.name || 'Main Branch'}</div>
                        </div>
                        <CardContent className="p-8 space-y-8">
                            <div className="flex justify-between items-center text-sm font-semibold text-gray-500 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <span className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Receipt Number</span>
                                    {receipt.billNumber}
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Date</span>
                                    {new Date(receipt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4 border-b border-gray-100 pb-2">Purchased Items</h3>
                                <div className="space-y-4">
                                    {receipt.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-start">
                                            <div className="flex items-start space-x-3">
                                                <div className="bg-blue-50 text-blue-700 font-medium rounded-full h-7 w-7 flex items-center justify-center text-xs mt-0.5">{item.quantity}x</div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{item.itemName}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">Rs. {Number(item.price).toFixed(2)} each</p>
                                                </div>
                                            </div>
                                            <span className="font-medium text-gray-900">Rs. {(item.quantity * item.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t-2 border-dashed border-gray-200 pt-6">
                                <div className="flex justify-between items-center bg-gray-900 text-white p-5 rounded-xl shadow-inner">
                                    <span className="text-lg font-semibold tracking-wide">Total Paid</span>
                                    <span className="text-3xl font-black tracking-tighter">Rs. {Number(receipt.totalAmount).toFixed(2)}</span>
                                </div>
                                <div className="text-center mt-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 uppercase tracking-widest">
                                        Paid via {receipt.paymentMethod || 'Credit Card'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 shadow-md">
                        <CardHeader className="pb-2 text-center">
                            <div className="mx-auto bg-green-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-3">
                                <Leaf className="h-7 w-7 text-green-600" />
                            </div>
                            <CardTitle className="text-green-900 font-bold">Paper Saved!</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-sm text-green-700 font-medium">
                            By accepting this digital receipt, you saved a 10-inch strip of thermal paper and prevented 5g of CO2 emissions.
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-gray-200">
                        <CardHeader className="pb-3 border-b border-gray-100 mb-3">
                            <CardTitle className="text-lg font-bold flex items-center">
                                <HandCoins className="h-5 w-5 mr-2 text-yellow-500" /> Loyalty Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                Every purchase at <strong>{receipt.retailer?.name || 'this shop'}</strong> brings you closer to exclusive discounts.
                            </p>
                            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold tracking-wide" onClick={() => router.push('/customer/dashboard/rewards')}>
                                View My Rewards
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-gray-200 bg-gray-900 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10">
                            <Ticket className="w-32 h-32" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <h3 className="text-lg font-bold mb-2 tracking-wide">Rate Your Visit</h3>
                            <p className="text-sm text-gray-400 mb-5 leading-relaxed">Tell us how your experience was to help the store improve.</p>
                            <Button variant="outline" className="w-full border-gray-600 text-gray-900 hover:bg-white hover:text-gray-900 transition-colors font-bold" onClick={() => router.push(`/customer/dashboard/feedback?receiptId=${receipt.id}`)}>
                                Leave Feedback
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
