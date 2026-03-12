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

    const renderStars = (rating: number) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

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
                            <CardHeader className="space-y-2 pb-2">
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle className="text-sm font-medium truncate">
                                        {fb.customer?.email || fb.Customer?.email || 'Anonymous'}
                                    </CardTitle>
                                    <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                                        {new Date(fb.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-1">
                                        {renderStars(fb.rating || 0)}
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{(fb.rating || 0).toFixed(1)} / 5</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 min-h-12">{fb.comment || 'No comment provided.'}</p>
                                <div className="mt-4 space-y-1 text-xs text-gray-500 font-mono">
                                    <div>
                                        Receipt: {fb.receipt?.billNumber || fb.Receipt?.billNumber || 'N/A'}
                                    </div>
                                    <div>
                                        Amount: Rs. {(fb.receipt?.totalAmount ?? fb.Receipt?.totalAmount ?? 0).toFixed(2)}
                                    </div>
                                    <div>
                                        Purchase Date:{' '}
                                        {fb.receipt?.createdAt || fb.Receipt?.createdAt
                                            ? new Date(fb.receipt?.createdAt || fb.Receipt?.createdAt).toLocaleString()
                                            : 'N/A'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
