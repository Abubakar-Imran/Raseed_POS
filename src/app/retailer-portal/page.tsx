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
        <div className="min-h-screen w-full bg-background text-foreground">
            {/* Top bar (mobile) */}
            <div className="flex items-center justify-start gap-4 bg-primary-foreground px-6 py-5 shadow-sm lg:hidden">
                <Image
                    src="/raseed_logo3.png"
                    alt="Raseed logo"
                    width={20}
                    height={20}
                    className="h-10 w-10 rounded-md object-contain"
                    priority
                />
                <span className="text-xl font-black tracking-widest uppercase text-primary"><a href="/">Raseed</a></span>
                {/* <span className="text-xs font-semibold text-green-100 uppercase tracking-widest">Retailer Portal</span> */}
            </div>

            <div className="flex min-h-[calc(100vh-64px)] lg:min-h-screen">
                {/* Left Side: Branding — desktop only */}
                <div className="relative hidden w-2/5 shrink-0 flex-col justify-between overflow-hidden bg-linear-to-br from-primary via-[#165d1e] to-[#0a3310] p-12 text-primary-foreground lg:flex xl:w-1/2">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl" />
                    <div className="absolute bottom-10 left-10 -ml-20 -mb-20 h-80 w-80 rounded-full bg-secondary opacity-10 blur-3xl" />

                    <div className="relative z-10">
                            <span className="text-2xl font-black tracking-widest uppercase text-primary-foreground opacity-90">Raseed</span>
                    </div>

                    <div className="relative z-10 max-w-xl flex flex-col items-center text-center">
                    <img src="/raseed_logo3.png" alt="Raseed Logo" className="w-44 h-44 mb-4" />                        
                        <h1 className="text-5xl xl:text-6xl font-black tracking-tight leading-tight mb-6">
                            Retailer <br />
                            <span className="bg-linear-to-r from-secondary to-accent bg-clip-text text-transparent">
                                Partner Portal
                            </span>
                        </h1>
                        <p className="max-w-md text-lg font-medium text-primary-foreground/80">
                            Issue digital receipts, build loyalty programs, and gain insights on customer behavior.
                            This portal is for authorized retailers only.
                        </p>
                    </div>

                    <div className="relative z-10 text-sm font-medium opacity-60">
                        © 2026 Raseed Technologies. All rights reserved.
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex flex-1 items-start justify-center overflow-y-auto bg-muted/40 p-5 sm:p-8 lg:items-center lg:bg-background lg:p-12 xl:p-16">
                    <div className="w-full max-w-md space-y-7 my-4 lg:my-0">
                        {/* Tab Switcher */}
                        <div className="flex gap-1 rounded-xl bg-muted p-1">
                            {tabs.map(({ key, label }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => { setTab(key); resetAuthForm(); }}
                                    className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all sm:text-sm ${tab === key ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Heading */}
                        <div className="space-y-1">
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                {headings[tab].title}
                            </h2>
                            <p className="text-sm sm:text-base font-medium text-muted-foreground">
                                {headings[tab].subtitle}
                            </p>
                        </div>

                        {/* Forms */}
                        {tab === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email" className="font-semibold text-foreground">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="owner@store.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 rounded-xl border-border bg-muted/40 px-4 text-base transition-all focus:bg-card focus:ring-2 focus:ring-primary/30"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password" className="font-semibold text-foreground">Password</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 rounded-xl border-border bg-muted/40 px-4 text-base transition-all focus:bg-card focus:ring-2 focus:ring-primary/30"
                                        required
                                    />
                                </div>
                                {error && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                                        {error}
                                    </div>
                                )}
                                <Button
                                    className="h-12 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-md transition-all hover:bg-[#0a3310] hover:shadow-lg"
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
                                    <Label htmlFor="reg-name" className="font-semibold text-foreground">Store Name</Label>
                                    <Input
                                        id="reg-name"
                                        type="text"
                                        placeholder="SuperMart Karachi"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-12 rounded-xl border-border bg-muted/40 px-4 text-base transition-all focus:bg-card focus:ring-2 focus:ring-primary/30"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-email" className="font-semibold text-foreground">Verification Email</Label>
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        placeholder="owner@supermart.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 rounded-xl border-border bg-muted/40 px-4 text-base transition-all focus:bg-card focus:ring-2 focus:ring-primary/30"
                                        required
                                    />
                                </div>
                                {error && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                                        {error}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="rounded-lg border border-green-200 bg-secondary p-3 text-center text-sm font-medium text-primary">
                                        {successMessage}
                                    </div>
                                )}
                                <Button
                                    className="h-12 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-md transition-all hover:bg-[#0a3310] hover:shadow-lg"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Sending Verification...' : 'Create Retailer Account'}
                                </Button>
                                <p className="text-center text-xs leading-5 text-muted-foreground">
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
