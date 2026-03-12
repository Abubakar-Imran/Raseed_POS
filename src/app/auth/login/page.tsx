'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_BASE } from '@/lib/api';
import { Suspense } from 'react';

function LoginForm() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
            setStep('OTP');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Invalid OTP');

            localStorage.setItem('customer_token', data.access_token);
            localStorage.setItem('customer_email', email);
            router.push('/customer/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white">
            {/* Left Side: Branding */}
            <div className="hidden lg:flex w-1/2 bg-linear-to-br from-[#0F4716] via-[#165d1e] to-[#0a3310] text-white flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 mix-blend-overlay blur-3xl animate-pulse" />
                <div className="absolute bottom-10 left-10 -ml-20 -mb-20 w-80 h-80 rounded-full bg-green-400 opacity-10 mix-blend-overlay blur-3xl" />

                <div className="relative z-10 flex items-center gap-3">
                    <span className="text-2xl font-black tracking-widest text-white uppercase opacity-90">Raseed</span>
                </div>

                <div className="relative z-10 max-w-xl">
                    <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
                        The Future of <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-green-200 to-green-100">
                            Digital Receipts
                        </span>
                    </h1>
                    <p className="text-lg text-green-50/80 font-medium max-w-md">
                        Access your purchase history, unlock loyalty rewards, and track your environmental impact.
                    </p>
                </div>

                <div className="relative z-10 text-sm font-medium opacity-70">
                    © 2026 Raseed Technologies. All rights reserved.
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 xl:p-24 bg-gray-50 lg:bg-white relative">
                <div className="lg:hidden absolute top-8 left-8">
                    <span className="text-2xl font-black tracking-widest text-[#0F4716] uppercase">Raseed</span>
                </div>

                <div className="w-full max-w-md space-y-8 bg-white lg:bg-transparent p-8 lg:p-0 rounded-3xl lg:rounded-none shadow-xl lg:shadow-none border lg:border-none border-gray-100 relative z-10">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                            {step === 'EMAIL' ? 'Welcome Back' : 'Secure Login'}
                        </h2>
                        <p className="text-gray-500 font-medium">
                            {step === 'EMAIL'
                                ? 'Enter your email address to access your wallet.'
                                : `Enter the 4-digit code sent to ${email}`}
                        </p>
                    </div>

                    <div className="mt-8">
                        {step === 'EMAIL' ? (
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-semibold text-gray-700">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="hello@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 px-4 text-base bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#0F4716] rounded-xl transition-all"
                                        required
                                    />
                                </div>
                                {error && (
                                    <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                                        {error}
                                    </div>
                                )}
                                <Button
                                    className="w-full h-12 text-base font-bold bg-[#0F4716] hover:bg-[#0a3310] text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' : 'Continue with Email'}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="otp" className="font-semibold text-gray-700">One-Time Password</Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="0000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="h-16 text-center text-4xl tracking-[0.5em] font-mono font-bold bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#0F4716] rounded-2xl transition-all placeholder:opacity-40"
                                        required
                                        maxLength={6}
                                    />
                                </div>
                                {error && (
                                    <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                                        {error}
                                    </div>
                                )}
                                <Button
                                    className="w-full h-12 text-base font-bold bg-[#0F4716] hover:bg-[#0a3310] text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Verifying...' : 'Complete Login'}
                                </Button>
                                <div className="text-center pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => { setStep('EMAIL'); setOtp(''); setError(''); }}
                                        className="text-sm font-semibold text-gray-500 hover:text-[#0F4716] transition-colors"
                                    >
                                        ← Change email address
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
