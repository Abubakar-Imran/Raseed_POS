'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth, API_BASE } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

export default function LoyaltyPage() {
    const queryClient = useQueryClient();
    const [retailerId, setRetailerId] = useState<string | null>(null);
    const [threshold, setThreshold] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');

    useEffect(() => {
        setRetailerId(localStorage.getItem('retailer_id'));
    }, []);

    const { data: rules } = useQuery({
        queryKey: ['loyalty-rules', retailerId],
        queryFn: () => fetchWithAuth(`/discounts/rules/retailers/${retailerId}`, {}, 'retailer'),
        enabled: !!retailerId,
    });

    const createRuleMutation = useMutation({
        mutationFn: async (newRule: any) => {
            const res = await fetch(`${API_BASE}/discounts/rules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('retailer_token')}`
                },
                body: JSON.stringify(newRule)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loyalty-rules', retailerId] });
            setThreshold('');
            setDiscountPercentage('');
        }
    });

    const handleCreateRule = (e: React.FormEvent) => {
        e.preventDefault();
        createRuleMutation.mutate({
            retailerId, ruleType: 'RECEIPT_COUNT',
            threshold: parseInt(threshold), discountPercentage: parseInt(discountPercentage), validDays: 30
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Loyalty Program</h2>
                <p className="text-gray-500">Configure rules to automatically reward repeat customers.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Active Rules</CardTitle></CardHeader>
                    <CardContent>
                        {rules?.length === 0 ? (
                            <p className="text-gray-500 text-sm">No rules configured yet.</p>
                        ) : (
                            <ul className="space-y-4">
                                {rules?.map((rule: any) => (
                                    <li key={rule.id} className="p-4 border rounded-md">
                                        <p className="font-medium">Every {rule.threshold} Receipts</p>
                                        <p className="text-sm text-green-600 font-semibold mt-1">Reward: {rule.discountPercentage}% off next purchase</p>
                                        <p className="text-xs text-gray-500 mt-1">Valid for {rule.validDays} days</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Create New Milestone Rule</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateRule} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Receipt Count Threshold</Label>
                                <Input type="number" placeholder="e.g. 5" value={threshold} onChange={e => setThreshold(e.target.value)} required />
                                <p className="text-xs text-gray-500">Number of visits required to unlock the reward.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Discount Percentage</Label>
                                <Input type="number" placeholder="e.g. 10" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} required />
                                <p className="text-xs text-gray-500">The percentage discount applied on their next visit.</p>
                            </div>
                            <Button type="submit" disabled={createRuleMutation.isPending}>Save Rule</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
