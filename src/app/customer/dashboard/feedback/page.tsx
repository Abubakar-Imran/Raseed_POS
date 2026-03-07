'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchWithAuth, API_BASE } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';

function FeedbackForm() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [selectedReceiptId, setSelectedReceiptId] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const storedEmail = localStorage.getItem('customer_email');
        if (storedEmail) setEmail(storedEmail);
        const queryReceiptId = searchParams.get('receiptId');
        if (queryReceiptId) setSelectedReceiptId(queryReceiptId);
    }, [searchParams]);

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

    const submitFeedbackMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_BASE}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('customer_token')}` },
                body: JSON.stringify({ customerId, receiptId: selectedReceiptId, rating, comment })
            });
            if (!res.ok) throw new Error('Submission failed');
            return res.json();
        },
        onSuccess: () => {
            setRating(0); setComment(''); setSelectedReceiptId('');
            alert('Thank you for your feedback!');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReceiptId || rating === 0) { alert('Please select a receipt and a rating.'); return; }
        submitFeedbackMutation.mutate();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Leave Feedback</h2>
            <Card>
                <CardHeader><CardTitle>Rate your recent visit</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select a Receipt</label>
                            <select value={selectedReceiptId} onChange={(e) => setSelectedReceiptId(e.target.value)} className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required>
                                <option value="" disabled>Select a recent purchase...</option>
                                {receipts?.map((r: any) => (
                                    <option key={r.id} value={r.id}>{r.retailer?.name} - {new Date(r.createdAt).toLocaleDateString()} (Rs. {r.totalAmount})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rating</label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                                        <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} hover:text-yellow-300 transition-colors`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Comments (Optional)</label>
                            <Textarea placeholder="Tell us about your experience..." value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-[100px]" />
                        </div>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={submitFeedbackMutation.isPending}>
                            {submitFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function FeedbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FeedbackForm />
        </Suspense>
    );
}
