'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RetailerFeedbackPage() {
    const [retailerId, setRetailerId] = useState<string | null>(null);

    useEffect(() => {
        setRetailerId(localStorage.getItem('retailer_id'));
    }, []);

    const { data: feedbacks, isLoading } = useQuery({
        queryKey: ['feedback', retailerId],
        queryFn: () => fetchWithAuth(`/feedback/retailers/${retailerId}`, {}, 'retailer'),
        enabled: !!retailerId,
    });

    if (isLoading) return <div>Loading feedback...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Customer Feedback</h2>
                <p className="text-gray-500">Monitor post-purchase ratings left by your customers.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {feedbacks?.length === 0 ? (
                    <p className="text-gray-500 col-span-3">No feedback received yet.</p>
                ) : (
                    feedbacks?.map((fb: any) => (
                        <Card key={fb.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{fb.customer?.email || 'Anonymous'}</CardTitle>
                                <div className="flex items-center text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="ml-1 text-sm font-bold text-gray-900">{fb.rating}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 line-clamp-3">{fb.comment || 'No comment provided.'}</p>
                                <div className="mt-4 text-xs text-gray-400 font-mono">
                                    Receipt: {fb.receipt?.billNumber} • Rs. {fb.receipt?.totalAmount}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
