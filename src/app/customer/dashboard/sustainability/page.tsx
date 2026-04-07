'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Leaf, TreePine, Recycle, CalendarDays } from 'lucide-react';
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

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">Sustainability Impact</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Loading your impact metrics...</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, index) => (
                        <Card key={index} className="border-border shadow-sm">
                            <CardContent className="p-6">
                                <div className="mb-3 h-4 w-28 animate-pulse rounded bg-muted" />
                                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    const safeReceipts = Array.isArray(receipts) ? receipts : [];
    const totalReceipts = safeReceipts.length;
    const estimatedCarbonSaved = totalReceipts * 0.005;
    const treesEquivalent = totalReceipts * 0.01;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyReceipts = safeReceipts.filter((receipt: any) => new Date(receipt.createdAt) >= startOfMonth).length;

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="text-left">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Sustainability Impact</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Track how your digital receipts contribute to reducing paper usage and emissions.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <Card className="border-border bg-linear-to-br from-secondary to-card shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                            <Leaf size={16} /> Thermal Paper Saved
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-primary">{totalReceipts}</div>
                        <p className="mt-1 text-xs text-primary/70">Digital receipts</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-linear-to-br from-secondary to-card shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                            <TreePine size={16} /> Carbon Reduced
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-primary">{estimatedCarbonSaved.toFixed(3)}</div>
                        <p className="mt-1 text-xs text-primary/70">kg CO2e estimated</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-linear-to-br from-secondary to-card shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                            <Recycle size={16} /> Trees Equivalent
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-primary">{treesEquivalent.toFixed(2)}</div>
                        <p className="mt-1 text-xs text-primary/70">Tree-units preserved</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-linear-to-br from-secondary to-card shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                            <CalendarDays size={16} /> This Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-primary">{monthlyReceipts}</div>
                        <p className="mt-1 text-xs text-primary/70">Eco-friendly purchases</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border bg-linear-to-r from-secondary to-accent/40 shadow-sm">
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-primary">Every digital receipt adds up to measurable impact.</p>
                        <p className="mt-1 text-xs text-primary/70">Keep collecting receipts to improve your monthly sustainability score.</p>
                    </div>
                    {/* <button className="rounded-sm px-1 py-0.5 text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 hover:text-[#0a3310]">
                        Share your impact milestone
                    </button> */}
                </CardContent>
            </Card>
        </div>
    );
}
