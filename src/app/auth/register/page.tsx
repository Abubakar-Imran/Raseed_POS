'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { API_BASE } from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registration failed');

            setSuccessMessage('Shop registered successfully! Redirecting to login...');
            setTimeout(() => {
                router.push('/auth/login?role=retailer');
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg border-gray-100">
                <CardHeader className="space-y-2 text-center pb-6">
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-gray-900">Partner with Raseed</CardTitle>
                    <CardDescription className="text-base text-gray-500">
                        Create a free account to modernize your shop with digital receipts and loyalty programs.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 font-semibold">Business Name</Label>
                            <Input id="name" type="text" placeholder="SuperMart Karachi" value={name} onChange={(e) => setName(e.target.value)} className="h-11 bg-white border-gray-200 focus:ring-2 focus:ring-green-500" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 font-semibold">Business Email</Label>
                            <Input id="email" type="email" placeholder="owner@supermart.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-white border-gray-200 focus:ring-2 focus:ring-green-500" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 font-semibold">Secure Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 bg-white border-gray-200 focus:ring-2 focus:ring-green-500" required minLength={6} />
                        </div>
                        {error && <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md border border-red-100 text-center">{error}</div>}
                        {successMessage && <div className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-md border border-green-200 text-center">{successMessage}</div>}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-4">
                        <Button className="w-full h-11 text-base font-bold bg-green-600 hover:bg-green-700" type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Register Shop'}
                        </Button>
                        <div className="text-center text-sm text-gray-500">
                            Already a partner?{' '}
                            <Link href="/auth/login?role=retailer" className="text-green-600 hover:underline font-semibold">
                                Sign in instead
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
