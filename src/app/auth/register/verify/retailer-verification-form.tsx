'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { API_BASE } from '@/lib/api';

export default function RetailerVerificationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [onboardingToken, setOnboardingToken] = useState('');
    const [storeName, setStoreName] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError('Missing verification token. Please open the link from your email again.');
                setIsVerifying(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/auth/register/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.message || 'Verification failed');

                setOnboardingToken(data.onboardingToken);
                setStoreName(data.retailer?.name || 'your store');
                setSuccessMessage('Email verified. Set a password to finish onboarding.');
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/register/set-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: onboardingToken, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save password');

            setSuccessMessage(data.message || 'Password set successfully. Redirecting to login...');
            setTimeout(() => {
                router.push('/retailer-portal');
            }, 1800);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md border-gray-100 shadow-lg">
                    <CardContent className="py-16 text-center text-gray-600">
                        Verifying your email...
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md border-gray-100 shadow-lg">
                <CardHeader className="space-y-2 text-center pb-6">
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-gray-900">
                        Finish {storeName} setup
                    </CardTitle>
                    <CardDescription className="text-base text-gray-500">
                        Your email is verified. Create the password you will use to sign in.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSetPassword}>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a secure password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11 bg-white border-gray-200 focus:ring-2 focus:ring-[#0F4716]"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repeat your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-11 bg-white border-gray-200 focus:ring-2 focus:ring-[#0F4716]"
                                required
                                minLength={6}
                            />
                        </div>
                        {error && <div className="text-sm font-medium text-red-500 bg-red-50 p-3 my-4 rounded-md border border-red-100 text-center">{error}</div>}
                        {successMessage && <div className="text-sm font-medium text-[#0F4716] bg-green-50 p-3 my-4 rounded-md border border-green-200 text-center">{successMessage}</div>}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-4">
                        <Button className="w-full h-11 text-base font-bold bg-[#0F4716] hover:bg-[#0a3310]" type="submit" disabled={isLoading || !onboardingToken}>
                            {isLoading ? 'Saving Password...' : 'Set Password'}
                        </Button>
                        <div className="text-center text-sm text-gray-500">
                            Already have a password?{' '}
                            <Link href="/retailer-portal" className="text-[#0F4716] hover:underline font-semibold">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}