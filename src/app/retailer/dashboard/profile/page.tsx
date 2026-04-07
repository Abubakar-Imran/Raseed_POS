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

    if (isFetching) return <div className="p-4 text-muted-foreground">Loading profile...</div>;

    return (
        <div className="space-y-5 w-full">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                    <UserCog className="w-7 h-7 text-muted-foreground" />
                    My Profile
                </h2>
                <p className="mt-1 text-muted-foreground">Update your business name or change your password.</p>
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
                                <Label htmlFor="profile-name" className="font-semibold text-foreground">Business Name</Label>
                                <Input
                                    id="profile-name"
                                    type="text"
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    placeholder="Your business name"
                                    className="h-11 rounded-xl border-border bg-card focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="profile-email" className="font-semibold text-foreground">
                                    Email
                                    <span className="ml-2 text-xs font-normal text-muted-foreground">(read-only)</span>
                                </Label>
                                <Input
                                    id="profile-email"
                                    type="email"
                                    value={profileEmail}
                                    readOnly
                                    className="h-11 cursor-not-allowed rounded-xl border-border bg-muted text-muted-foreground"
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
                                <Label htmlFor="new-password" className="font-semibold text-foreground">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Leave blank to keep current"
                                    className="h-11 rounded-xl border-border bg-card focus:ring-2 focus:ring-primary/30"
                                    minLength={newPassword ? 6 : undefined}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="font-semibold text-foreground">Confirm New Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat new password"
                                    className="h-11 rounded-xl border-border bg-card focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-end">
                    <Card className="border-border bg-secondary/30 xl:col-span-2">
                        <CardContent className="pt-5 space-y-2">
                            <Label htmlFor="current-password" className="font-semibold text-foreground">
                                Current Password
                                <span className="ml-2 text-xs font-normal text-muted-foreground">(required to save any changes)</span>
                            </Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter your current password"
                                className="h-11 rounded-xl border-border bg-card focus:ring-2 focus:ring-primary/30"
                                required
                            />
                        </CardContent>
                    </Card>

                    <div className="xl:justify-self-end w-full xl:w-auto">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-11 w-full rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground hover:bg-[#0a3310] xl:w-auto"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="rounded-lg border border-green-200 bg-secondary p-3 text-sm font-medium text-primary">
                        {success}
                    </div>
                )}
            </form>
        </div>
    );
}
