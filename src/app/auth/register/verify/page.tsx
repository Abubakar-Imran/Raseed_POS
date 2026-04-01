import { Suspense } from 'react';
import RetailerVerificationForm from './retailer-verification-form';

export default function RetailerVerificationPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 text-gray-600">Loading verification page...</div>}>
            <RetailerVerificationForm />
        </Suspense>
    );
}