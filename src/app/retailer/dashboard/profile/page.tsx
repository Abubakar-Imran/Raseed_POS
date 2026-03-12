'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { API_BASE } from '@/lib/api';
import { UserCog } from 'lucide-react';

export default function RetailerProfilePage() {
    const [retailerId, setRetailerId] = useState<string | null>(null);

    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const id = localStorage.getItem('retailer_id');
        setRetailerId(id);
        if (id) {
            fetch(`${API_BASE}/retailers/${id}`)
                .then((r) => r.json())
                .then((data) => {
                    if (data?.name) setProfileName(data.name);
                    if (data?.email) setProfileEmail(data.email);
                })
                .catch(() => {})
                .finally(() => setIsFetching(false));
        } else {
            setIsFetching(false);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentPassword) {
            setError('Please enter your current password to save changes.');
            return;
        }
        if (newPassword && newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (!retailerId) {
            setError('Session expired. Please log in again.');
            return;
        }

        const body: Record<string, string> = { currentPassword };
        if (profileName.trim()) body.name = profileName.trim();
        if (newPassword) body.newPassword = newPassword;

        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/retailers/${retailerId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Update failed');

            setSuccess('Profile updated successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <div className="text-gray-500 p-4">Loading profile...</div>;

    return (
        <div className="space-y-5 w-full">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                    <UserCog className="w-7 h-7 text-gray-600" />
                    My Profile
                </h2>
                <p className="text-gray-500 mt-1">Update your business name or change your password.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Account Information</CardTitle>
                            <CardDescription>Your email address is permanent and cannot be changed.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="profile-name" className="font-semibold text-gray-700">Business Name</Label>
                                <Input
                                    id="profile-name"
                                    type="text"
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    placeholder="Your business name"
                                    className="h-11 bg-white border-gray-200 focus:ring-2 focus:ring-black rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="profile-email" className="font-semibold text-gray-700">
                                    Email
                                    <span className="ml-2 text-xs font-normal text-gray-400">(read-only)</span>
                                </Label>
                                <Input
                                    id="profile-email"
                                    type="email"
                                    value={profileEmail}
                                    readOnly
                                    className="h-11 bg-gray-100 border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Change Password</CardTitle>
                            <CardDescription>Leave blank if you don't want to change your password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password" className="font-semibold text-gray-700">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Leave blank to keep current"
                                    className="h-11 bg-white border-gray-200 focus:ring-2 focus:ring-black rounded-xl"
                                    minLength={newPassword ? 6 : undefined}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="font-semibold text-gray-700">Confirm New Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat new password"
                                    className="h-11 bg-white border-gray-200 focus:ring-2 focus:ring-black rounded-xl"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-end">
                    <Card className="border-gray-300 bg-gray-50 xl:col-span-2">
                        <CardContent className="pt-5 space-y-2">
                            <Label htmlFor="current-password" className="font-semibold text-gray-700">
                                Current Password
                                <span className="ml-2 text-xs font-normal text-gray-400">(required to save any changes)</span>
                            </Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter your current password"
                                className="h-11 bg-white border-gray-200 focus:ring-2 focus:ring-black rounded-xl"
                                required
                            />
                        </CardContent>
                    </Card>

                    <div className="xl:justify-self-end w-full xl:w-auto">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-11 w-full xl:w-auto px-8 text-base font-bold bg-black hover:bg-gray-800 text-white rounded-xl"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="text-sm font-medium text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                        {success}
                    </div>
                )}
            </form>
        </div>
    );
}
