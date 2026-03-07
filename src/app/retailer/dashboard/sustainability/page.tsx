'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Leaf, TreePine } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RetailerSustainabilityPage() {
    const [retailerId, setRetailerId] = useState<string | null>(null);

    useEffect(() => {
        setRetailerId(localStorage.getItem('retailer_id'));
    }, []);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['sustainability', retailerId],
        queryFn: () => fetchWithAuth(`/sustainability/retailers/${retailerId}`, {}, 'retailer'),
        enabled: !!retailerId,
    });

    if (isLoading) return <div>Loading sustainability impact...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-green-700">Sustainability Impact</h2>
                <p className="text-gray-500">Track the positive environmental impact of switching to digital receipts.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-green-200 bg-green-50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-green-800">Paper Rolls Saved</CardTitle>
                        <Leaf className="text-green-600" size={24} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold text-green-700">{stats?.paperSavedCount || 0}</div>
                        <p className="mt-2 text-sm text-green-600">Total digital receipts issued instead of printing.</p>
                    </CardContent>
                </Card>
                <Card className="border-teal-200 bg-teal-50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-teal-800">Carbon Saved (kg CO2e)</CardTitle>
                        <TreePine className="text-teal-600" size={24} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold text-teal-700">{(stats?.estimatedCarbonSaved || 0).toFixed(3)}</div>
                        <p className="mt-2 text-sm text-teal-600">Estimated carbon footprint reduction.</p>
                    </CardContent>
                </Card>
            </div>
            <div className="bg-white p-6 rounded-lg border mt-8">
                <h3 className="font-semibold text-lg mb-2">How we calculate this</h3>
                <p className="text-gray-600 text-sm">
                    Every standard printed receipt consumes thermal paper, water for production, and oil for transportation.
                    By delivering a digital receipt, Raseed prevents approximately <strong>5 grams</strong> of CO2 emissions
                    from entering the atmosphere per transaction.
                </p>
            </div>
        </div>
    );
}
