'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth, API_BASE } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function LoyaltyPage() {
    const queryClient = useQueryClient();
    const [retailerId, setRetailerId] = useState<string | null>(null);
    const [threshold, setThreshold] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

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

    const deleteRuleMutation = useMutation({
        mutationFn: async (ruleId: string) => {
            const res = await fetch(`${API_BASE}/discounts/rules/${ruleId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('retailer_token')}`
                },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete rule');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loyalty-rules', retailerId] });
            setDeletingRuleId(null);
        },
        onError: () => {
            setDeletingRuleId(null);
        }
    });

    const handleCreateRule = (e: React.FormEvent) => {
        e.preventDefault();
        createRuleMutation.mutate({
            retailerId, ruleType: 'RECEIPT_COUNT',
            threshold: parseInt(threshold), discountPercentage: parseInt(discountPercentage), validDays: 30
        });
    };

    const handleDeleteRule = (ruleId: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this loyalty rule?');
        if (!confirmed) return;
        setDeletingRuleId(ruleId);
        deleteRuleMutation.mutate(ruleId);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Loyalty Program</h2>
                <p className="text-muted-foreground">Configure rules to automatically reward repeat customers.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Active Rules</CardTitle></CardHeader>
                    <CardContent>
                        {rules?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No rules configured yet.</p>
                        ) : (
                            <ul className="space-y-4">
                                {rules?.map((rule: any) => (
                                    <li key={rule.id} className="p-4 border rounded-md flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-medium">Every {rule.threshold} Receipts</p>
                                            <p className="mt-1 text-sm font-semibold text-primary">Reward: {rule.discountPercentage}% off next purchase</p>
                                            <p className="mt-1 text-xs text-muted-foreground">Valid for {rule.validDays} days</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => handleDeleteRule(rule.id)}
                                            disabled={deleteRuleMutation.isPending && deletingRuleId === rule.id}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            {deleteRuleMutation.isPending && deletingRuleId === rule.id ? 'Deleting...' : 'Delete'}
                                        </Button>
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
                                <p className="text-xs text-muted-foreground">Number of visits required to unlock the reward.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Discount Percentage</Label>
                                <Input type="number" placeholder="e.g. 10" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} required />
                                <p className="text-xs text-muted-foreground">The percentage discount applied on their next visit.</p>
                            </div>
                            <Button type="submit" disabled={createRuleMutation.isPending}>Save Rule</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
