'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Leaf, TreePine } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CustomerSustainabilityPage() {
    const [email, setEmail] = useState('');
    const [customerId, setCustomerId] = useState<string | null>(null);

    useEffect(() => {
        const customerEmail = localStorage.getItem('customer_email');
        if (customerEmail) setEmail(customerEmail);
    }, []);

    const { data: customerData } = useQuery({
        queryKey: ['customer', email],
        queryFn: async () => fetchWithAuth(`/customers/email/${email}`),
        enabled: !!email,
    });

    useEffect(() => {
        if (customerData?.id) setCustomerId(customerData.id);
    }, [customerData]);

    const { data: receipts, isLoading } = useQuery({
        queryKey: ['customer-receipts', customerId],
        queryFn: () => fetchWithAuth(`/receipts/customers/${customerId}`),
        enabled: !!customerId,
    });

    if (isLoading) return <div>Loading impact...</div>;

    const totalReceipts = receipts?.length || 0;
    const estimatedCarbonSaved = totalReceipts * 0.005;

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-10 text-center max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-3xl mb-6 shadow-sm border border-green-100/50">
                    <Leaf className="w-16 h-16 text-green-600" />
                </div>
                <h2 className="text-4xl font-black tracking-tight text-gray-900 mb-3">Your Impact</h2>
                <p className="text-gray-500 text-lg">
                    By choosing Raseed digital receipts, you've directly contributed to a greener planet.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white shadow-md hover:shadow-lg transition-shadow rounded-3xl overflow-hidden p-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-green-800 text-lg font-bold">Thermal Paper Saved</CardTitle>
                        <Leaf className="text-green-500 opacity-50" size={24} />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black text-green-700">{totalReceipts}</span>
                            <span className="text-green-600 font-semibold text-base">Receipts</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white shadow-md hover:shadow-lg transition-shadow rounded-3xl overflow-hidden p-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-teal-800 text-lg font-bold">Carbon Footprint Reduced</CardTitle>
                        <TreePine className="text-teal-500 opacity-50" size={24} />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black text-teal-700">{estimatedCarbonSaved.toFixed(3)}</span>
                            <span className="text-teal-600 font-semibold text-base">kg CO2e</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="text-center mt-8">
                <button className="text-sm font-semibold text-green-600 underline underline-offset-4">
                    Share your impact milestone
                </button>
            </div>
        </div>
    );
}
