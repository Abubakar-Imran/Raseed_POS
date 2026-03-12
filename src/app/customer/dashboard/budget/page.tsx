'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wallet, CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CustomerBudgetPage() {
    const [email, setEmail] = useState('');
    const [customerId, setCustomerId] = useState<string | null>(null);

    const [budgetPeriod, setBudgetPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [budgetInput, setBudgetInput] = useState('');
    const [savedBudget, setSavedBudget] = useState<number | null>(null);
    const [budgetMessage, setBudgetMessage] = useState('');

    useEffect(() => {
        const storedEmail = localStorage.getItem('customer_email');
        if (storedEmail) setEmail(storedEmail);
    }, []);

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

    useEffect(() => {
        if (!customerId) return;
        const raw = localStorage.getItem(`customer_budget_${customerId}`);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            if (parsed?.period) setBudgetPeriod(parsed.period);
            if (typeof parsed?.amount === 'number') {
                setSavedBudget(parsed.amount);
                setBudgetInput(String(parsed.amount));
            }
        } catch {
            localStorage.removeItem(`customer_budget_${customerId}`);
        }
    }, [customerId]);

    const safeReceipts = Array.isArray(receipts) ? receipts : [];
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = (now.getDay() + 6) % 7;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const periodStart =
        budgetPeriod === 'daily' ? startOfDay :
        budgetPeriod === 'weekly' ? startOfWeek :
            startOfMonth;

    const currentSpending = safeReceipts
        .filter((receipt: any) => new Date(receipt.createdAt) >= periodStart)
        .reduce((sum: number, receipt: any) => sum + (receipt.totalAmount ?? 0), 0);

    const remainingBudget = savedBudget !== null ? savedBudget - currentSpending : null;
    const budgetProgress = savedBudget && savedBudget > 0
        ? Math.min((currentSpending / savedBudget) * 100, 100)
        : 0;

    const handleSaveBudget = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId) return;
        const parsed = Number(budgetInput);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            setBudgetMessage('Please enter a valid budget amount greater than 0.');
            return;
        }
        const payload = { period: budgetPeriod, amount: parsed };
        localStorage.setItem(`customer_budget_${customerId}`, JSON.stringify(payload));
        setSavedBudget(parsed);
        setBudgetMessage('Budget updated successfully.');
    };

    const handleClearBudget = () => {
        if (!customerId) return;
        localStorage.removeItem(`customer_budget_${customerId}`);
        setSavedBudget(null);
        setBudgetInput('');
        setBudgetMessage('Budget removed.');
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Budget Tracker</h2>
                <p className="text-sm text-gray-500 mt-1">Set a spending target and monitor your usage in real-time.</p>
            </div>

            <Card className="border-gray-200 shadow-sm overflow-hidden">
                <div className="h-1 bg-linear-to-r from-[#0F4716] via-[#165d1e] to-[#0a3310]" />
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-[#0F4716]" />
                        Manage Budget
                    </CardTitle>
                    <CardDescription>Choose your budget cycle and amount.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSaveBudget} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div className="space-y-2">
                            <Label>Budget Type</Label>
                            <select
                                value={budgetPeriod}
                                onChange={(e) => setBudgetPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                                className="w-full h-10 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F4716]/50"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Budget Amount (Rs.)</Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="e.g. 10000"
                                value={budgetInput}
                                onChange={(e) => setBudgetInput(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">Save Budget</Button>
                    </form>

                    {savedBudget !== null && (
                        <div className="rounded-lg border border-green-100 bg-green-50/50 p-3 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-gray-900 capitalize flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-[#0F4716]" />
                                    {budgetPeriod} budget
                                </p>
                                <Button type="button" variant="outline" className="h-8" onClick={handleClearBudget}>Clear</Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                <div className="rounded-md bg-white p-3 border border-green-100">
                                    <p className="text-gray-500">Budget</p>
                                    <p className="font-bold text-gray-900">Rs. {savedBudget.toFixed(2)}</p>
                                </div>
                                <div className="rounded-md bg-white p-3 border border-green-100">
                                    <p className="text-gray-500">Spent</p>
                                    <p className="font-bold text-gray-900">Rs. {currentSpending.toFixed(2)}</p>
                                </div>
                                <div className="rounded-md bg-white p-3 border border-green-100">
                                    <p className="text-gray-500">Remaining</p>
                                    <p className={`font-bold ${remainingBudget !== null && remainingBudget < 0 ? 'text-red-600' : 'text-[#0F4716]'}`}>
                                        Rs. {remainingBudget !== null ? remainingBudget.toFixed(2) : '0.00'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <div className="h-2 w-full bg-green-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${budgetProgress >= 100 ? 'bg-red-500' : 'bg-[#0F4716]'}`}
                                        style={{ width: `${budgetProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{budgetProgress.toFixed(1)}% of your {budgetPeriod} budget used</p>
                            </div>
                        </div>
                    )}

                    {budgetMessage && <p className="text-xs font-medium text-gray-600">{budgetMessage}</p>}
                </CardContent>
            </Card>
        </div>
    );
}
