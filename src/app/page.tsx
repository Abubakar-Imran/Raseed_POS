'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Receipt, ArrowRight, Leaf } from 'lucide-react';

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-linear-to-br from-[#0F4716] via-[#165d1e] to-[#0a3310] text-white flex flex-col relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 mix-blend-overlay blur-3xl animate-pulse" />
            <div className="absolute bottom-10 left-10 -ml-20 -mb-20 w-80 h-80 rounded-full bg-green-400 opacity-10 mix-blend-overlay blur-3xl" />

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-8 py-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl shadow-inner border border-white/20">
                        <Receipt className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black tracking-widest uppercase opacity-90">Raseed</span>
                </div>
            </header>

            {/* Hero */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
                <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight mb-6">
                    The Future of{' '}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-green-200 to-green-100">
                        Digital Receipts
                    </span>
                </h1>
                <p className="text-lg lg:text-xl text-green-50/80 font-medium max-w-2xl mb-12">
                    Access your purchase history, unlock loyalty rewards, and track your environmental
                    impact — all in one place without touching a single piece of thermal paper.
                </p>

                <div className="flex justify-center w-full max-w-md">
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="group bg-white text-[#0F4716] hover:bg-green-50 font-bold py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                    >
                        <Receipt className="w-5 h-5" />
                        Get Started
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 text-center py-8 text-sm font-medium opacity-60 flex items-center justify-center gap-2">
                <Leaf className="w-4 h-4" />
                <span>Saving trees, one receipt at a time</span>
            </footer>
        </div>
    );
}
