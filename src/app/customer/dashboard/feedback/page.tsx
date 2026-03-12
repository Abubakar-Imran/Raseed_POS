'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchWithAuth, API_BASE } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquarePlus, CheckCircle2, Receipt, AlertCircle } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';

const RATING_LABELS: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Great',
    5: 'Excellent',
};

function FeedbackForm() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [selectedReceiptId, setSelectedReceiptId] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [validationError, setValidationError] = useState('');

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
            setRating(0);
            setHoverRating(0);
            setComment('');
            setSelectedReceiptId('');
            setSubmitted(true);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');
        if (!selectedReceiptId) { setValidationError('Please select a receipt to review.'); return; }
        if (rating === 0) { setValidationError('Please choose a star rating before submitting.'); return; }
        submitFeedbackMutation.mutate();
    };

    const safeReceipts = Array.isArray(receipts) ? receipts : [];
    const activeRating = hoverRating || rating;

    if (submitted) {
        return (
            <div className="space-y-4 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Leave Feedback</h2>
                    <p className="text-gray-500 text-sm mt-1">Help stores improve by sharing your experience.</p>
                </div>
                <Card className="border-green-200 bg-linear-to-br from-green-50 to-white shadow-sm">
                    <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-[#0F4716]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Thank you for your feedback!</h3>
                            <p className="text-sm text-gray-500 mt-1">Your review helps retailers serve you better.</p>
                        </div>
                        <Button variant="outline" className="mt-2" onClick={() => setSubmitted(false)}>
                            Submit Another
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Leave Feedback</h2>
                    <p className="text-gray-500 text-sm mt-1">Help stores improve by sharing your experience.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#0F4716] font-medium self-start sm:self-auto bg-green-50 border border-green-200 rounded-full px-3 py-1">
                    <MessageSquarePlus size={14} />
                    {safeReceipts.length} receipt{safeReceipts.length === 1 ? '' : 's'} available
                </div>
            </div>

            <Card className="border-gray-200 shadow-sm overflow-hidden">
                <div className="h-1 bg-linear-to-r from-[#0F4716] via-[#165d1e] to-[#0a3310]" />

                <CardContent className="p-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Receipt selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Receipt size={14} className="text-gray-400" /> Select a Receipt
                            </label>
                            <select
                                value={selectedReceiptId}
                                onChange={(e) => { setSelectedReceiptId(e.target.value); setValidationError(''); }}
                                className="w-full h-10 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4716]/50 transition-shadow"
                                required
                            >
                                <option value="" disabled>Choose a recent purchase…</option>
                                {safeReceipts.map((r: any) => (
                                    <option key={r.id} value={r.id}>
                                        {r.retailer?.name || 'Store'} — {new Date(r.createdAt).toLocaleDateString()} (Rs. {Number(r.totalAmount ?? 0).toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Star rating */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Star size={14} className="text-gray-400" /> Rating
                            </label>
                            <div className="flex items-center gap-1 sm:gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => { setRating(star); setValidationError(''); }}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-sm transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Star
                                            className={`w-9 h-9 transition-colors duration-100 ${
                                                star <= activeRating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-200 hover:text-yellow-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                                {activeRating > 0 && (
                                    <span className="ml-2 text-sm font-semibold text-yellow-600">
                                        {RATING_LABELS[activeRating]}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                Comments <span className="font-normal text-gray-400">(optional)</span>
                            </label>
                            <Textarea
                                placeholder="Tell us about your experience…"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="min-h-28 resize-none focus-visible:ring-[#0F4716]/50"
                            />
                        </div>

                        {/* Validation error */}
                        {validationError && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                                <AlertCircle size={15} className="shrink-0" />
                                {validationError}
                            </div>
                        )}

                        {/* Mutation error */}
                        {submitFeedbackMutation.isError && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                                <AlertCircle size={15} className="shrink-0" />
                                Submission failed. Please try again.
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-[#0F4716] hover:bg-[#0a3310] focus-visible:ring-[#0F4716]/50 font-semibold"
                            disabled={submitFeedbackMutation.isPending}
                        >
                            {submitFeedbackMutation.isPending ? 'Submitting…' : 'Submit Feedback'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Info callout */}
            <Card className="border-green-200 bg-linear-to-r from-green-50 to-green-100/50 shadow-sm">
                <CardContent className="p-4">
                    <p className="text-sm font-semibold text-[#0F4716]">Your opinion makes a difference.</p>
                    <CardDescription className="mt-1 text-xs text-[#0F4716]/70">
                        Every review directly helps partnered retailers improve their service and your future experience.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}

export default function FeedbackPage() {
    return (
        <Suspense fallback={
            <div className="space-y-4">
                <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
                <div className="h-64 rounded-xl bg-gray-200 animate-pulse" />
            </div>
        }>
            <FeedbackForm />
        </Suspense>
    );
}
