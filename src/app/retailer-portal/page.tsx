'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { API_BASE } from '@/lib/api';
import Image from 'next/image';


type Tab = 'login' | 'register';

export default function RetailerPortalPage() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('login');

    // Shared auth fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const resetAuthForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setError('');
        setSuccessMessage('');
    };

    // Retailer Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');

            localStorage.setItem('retailer_token', data.access_token);
            localStorage.setItem('retailer_id', data.retailerId);
            router.push('/retailer/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Register New Retailer (Admin use)
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

            setSuccessMessage('Store registered. Check the verification email, then complete password setup from the link.');
            resetAuthForm();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const tabs: { key: Tab; label: string }[] = [
        { key: 'login', label: 'Sign In' },
        { key: 'register', label: 'Register' },
    ];

    const headings: Record<Tab, { title: string; subtitle: string }> = {
        login: { title: 'Retailer Login', subtitle: 'Sign in to access your retailer dashboard.' },
        register: { title: 'Create Retailer Account', subtitle: '' },
    };

    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Top bar (mobile) */}
            <div className="lg:hidden flex items-center gap-4 justify-start px-6 py-5 bg-[#0F4716]">
                <Image
                    src="/raseed_logo3.png"
                    alt="Raseed logo"
                    width={20}
                    height={20}
                    className="h-10 w-10 rounded-md object-contain"
                    priority
                />
                <span className="text-xl font-black tracking-widest text-white uppercase"><a href="/">Raseed</a></span>
                {/* <span className="text-xs font-semibold text-green-100 uppercase tracking-widest">Retailer Portal</span> */}
            </div>

            <div className="flex min-h-[calc(100vh-64px)] lg:min-h-screen">
                {/* Left Side: Branding — desktop only */}
                <div className="hidden lg:flex w-2/5 xl:w-1/2 bg-linear-to-br from-[#0F4716] via-[#165d1e] to-[#0a3310] text-white flex-col justify-between p-12 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl" />
                    <div className="absolute bottom-10 left-10 -ml-20 -mb-20 w-80 h-80 rounded-full bg-green-300 opacity-10 blur-3xl" />

                    <div className="relative z-10">
                        <span className="text-2xl font-black tracking-widest text-white uppercase opacity-90">Raseed</span>
                    </div>

                    <div className="relative z-10 max-w-xl flex flex-col items-center text-center">
                    <img src="/raseed_logo3.png" alt="Raseed Logo" className="w-44 h-44 mb-4" />                        
                        <h1 className="text-5xl xl:text-6xl font-black tracking-tight leading-tight mb-6">
                            Retailer <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-green-200 to-green-100">
                                Partner Portal
                            </span>
                        </h1>
                        <p className="text-lg text-green-100 font-medium max-w-md">
                            Issue digital receipts, build loyalty programs, and gain insights on customer behavior.
                            This portal is for authorized retailers only.
                        </p>
                    </div>

                    <div className="relative z-10 text-sm font-medium opacity-60">
                        © 2026 Raseed Technologies. All rights reserved.
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 flex items-start lg:items-center justify-center p-5 sm:p-8 lg:p-12 xl:p-16 bg-gray-50 lg:bg-white overflow-y-auto">
                    <div className="w-full max-w-md space-y-7 my-4 lg:my-0">
                        {/* Tab Switcher */}
                        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                            {tabs.map(({ key, label }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => { setTab(key); resetAuthForm(); }}
                                    className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${tab === key ? 'bg-white shadow-sm text-[#0F4716]' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Heading */}
                        <div className="space-y-1">
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                                {headings[tab].title}
                            </h2>
                            <p className="text-sm sm:text-base text-gray-500 font-medium">
                                {headings[tab].subtitle}
                            </p>
                        </div>

                        {/* Forms */}
                        {tab === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email" className="font-semibold text-gray-700">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="owner@store.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 px-4 text-base bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#0F4716] rounded-xl transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password" className="font-semibold text-gray-700">Password</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 px-4 text-base bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#0F4716] rounded-xl transition-all"
                                        required
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
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>
                        )}

                        {tab === 'register' && (
                            <form onSubmit={handleRegister} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="reg-name" className="font-semibold text-gray-700">Store Name</Label>
                                    <Input
                                        id="reg-name"
                                        type="text"
                                        placeholder="SuperMart Karachi"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-12 px-4 text-base bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#0F4716] rounded-xl transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-email" className="font-semibold text-gray-700">Verification Email</Label>
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        placeholder="owner@supermart.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 px-4 text-base bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#0F4716] rounded-xl transition-all"
                                        required
                                    />
                                </div>
                                {error && (
                                    <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                                        {error}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="text-sm font-medium text-[#0F4716] bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                                        {successMessage}
                                    </div>
                                )}
                                <Button
                                    className="w-full h-12 text-base font-bold bg-[#0F4716] hover:bg-[#0a3310] text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Sending Verification...' : 'Create Retailer Account'}
                                </Button>
                                <p className="text-xs text-gray-500 text-center leading-5">
                                    We’ll email a verification link first. Password setup happens after the email is confirmed.
                                </p>
                            </form>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
