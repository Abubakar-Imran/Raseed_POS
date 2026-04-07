'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { API_BASE } from '@/lib/api';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
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
                body: JSON.stringify({ name, email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registration failed');

            setSuccessMessage('Store registered. Check your email for a verification link, then set your password to finish onboarding.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg border-gray-100">
                <CardHeader className="space-y-4 text-center pb-6">
                    <div className="flex justify-center">
                        <Image
                            src="/raseed_logo3.png"
                            alt="Raseed logo"
                            width={72}
                            height={72}
                            className="h-18 w-18 rounded-xl object-contain"
                            priority
                        />
                    </div>
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-gray-900">Partner with Raseed</CardTitle>
                    <CardDescription className="text-base text-gray-500">
                        Register your store first. We will email a verification link before you create the password.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 font-semibold">Store Name</Label>
                            <Input id="name" type="text" placeholder="SuperMart Karachi" value={name} onChange={(e) => setName(e.target.value)} className="h-11 bg-white border-gray-200 focus:ring-2 focus:ring-[#0F4716]" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 font-semibold">Verification Email</Label>
                            <Input id="email" type="email" placeholder="owner@supermart.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-white border-gray-200 focus:ring-2 focus:ring-[#0F4716]" required />
                        </div>
                        {error && <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md border border-red-100 text-center">{error}</div>}
                        {successMessage && <div className="text-sm font-medium text-[#0F4716] bg-green-50 p-3 rounded-md border border-green-200 text-center">{successMessage}</div>}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-4">
                        <Button className="w-full h-11 text-base font-bold bg-[#0F4716] hover:bg-[#0a3310]" type="submit" disabled={isLoading}>
                            {isLoading ? 'Sending Verification...' : 'Register Store'}
                        </Button>
                        <div className="text-center text-sm text-gray-500">
                            Already verified?{' '}
                            <Link href="/retailer-portal" className="text-[#0F4716] hover:underline font-semibold">
                                Sign in instead
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
