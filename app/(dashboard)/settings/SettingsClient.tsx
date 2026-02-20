'use client';


import { useSettingsStore } from '@/lib/settings-store';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun, Download, Trash2, Key, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { getPortfolioItems } from '@/lib/actions/portfolio';
import { updateUserProfile } from '@/lib/actions/user';

interface SettingsClientProps {
    user: {
        name: string;
        username: string;
        email: string;
    };
}

export function SettingsClient({ user }: SettingsClientProps) {
    const { theme, setTheme } = useTheme();
    const { currency, displayName, setCurrency, setDisplayName, alerts, toggleAlert } = useSettingsStore();
    const { toast } = useToast();

    // Hydration fix
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Local profile state
    const [nameInput, setNameInput] = useState(user.name);
    const [usernameInput, setUsernameInput] = useState(user.username);
    const [passwordInput, setPasswordInput] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    if (!mounted) return null;

    const handleExport = async () => {
        try {
            const items = await getPortfolioItems();
            const headers = ['code', 'name', 'set', 'quantity', 'purchase_price', 'current_price'];
            const csvContent = [
                headers.join(','),
                ...items.map(item => [
                    item.code,
                    `"${item.name}"`,
                    `"${item.set}"`,
                    item.quantity,
                    item.purchasePrice,
                    item.currentPrice,
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `optcg-collection-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            toast('Portfolio exported as CSV', 'success');
        } catch {
            toast('Failed to export portfolio', 'error');
        }
    };

    const handleClearData = () => {
        toast('Database reset requires server-side action. Coming soon!', 'warning');
    };

    const handleUpdateProfile = async () => {
        if (passwordInput && passwordInput !== confirmPassword) {
            toast('Passwords do not match', 'error');
            return;
        }

        setIsUpdatingProfile(true);
        try {
            const data: any = {};
            if (nameInput !== user.name) data.name = nameInput;
            if (usernameInput !== user.username) data.username = usernameInput;
            if (passwordInput) data.password = passwordInput;

            const res = await updateUserProfile(data);

            if (res.success) {
                toast('Profile updated successfully', 'success');
                setDisplayName(nameInput); // sync local zustand if they still use it for UI
                setPasswordInput('');
                setConfirmPassword('');
            } else {
                toast(res.error || 'Failed to update profile', 'error');
            }
        } catch (error) {
            toast('An error occurred', 'error');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    return (
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto w-full pb-20 md:pb-8">
            <header className="mb-8 border-b border-border pb-4">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Manage your preferences and application data.
                </p>
            </header>

            <div className="space-y-8">

                {/* Appearance */}
                <section className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🎨 Appearance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Theme</label>
                            <div className="flex gap-2 bg-muted/30 p-1 rounded-lg w-fit">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`p-2 rounded-md flex items-center gap-2 text-sm transition-colors ${theme === 'light' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                                >
                                    <Sun size={16} /> Light
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`p-2 rounded-md flex items-center gap-2 text-sm transition-colors ${theme === 'dark' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                                >
                                    <Moon size={16} /> Dark
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`p-2 rounded-md flex items-center gap-2 text-sm transition-colors ${theme === 'system' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                                >
                                    <Monitor size={16} /> System
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Profile Settings */}
                <section className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <User size={20} className="text-primary" /> Profile
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Display Name</label>
                            <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="How you want to be called"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <input
                                type="text"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Unique username for login"
                            />
                        </div>
                    </div>

                    <div className="border-t border-border/50 pt-6 mt-6 mb-6">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                            <Key size={16} /> Change Password (Optional)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border/50">
                        <button
                            onClick={handleUpdateProfile}
                            disabled={isUpdatingProfile || (nameInput === user.name && usernameInput === user.username && !passwordInput)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                            {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                    </div>
                </section>

                {/* General Application Preferences */}
                <section className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        ⚙️ Application
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Base Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => {
                                    setCurrency(e.target.value as 'USD' | 'EUR' | 'JPY');
                                    toast(`Currency set to ${e.target.value}`, 'success');
                                }}
                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="JPY">JPY (¥)</option>
                            </select>
                            <p className="text-xs text-muted-foreground mt-1">
                                Prices are converted from USD using approximate rates.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Alerts */}
                <section className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🔔 Notifications
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Price Spikes</p>
                                <p className="text-sm text-muted-foreground">Notify when a card rises &gt;15% in 24h</p>
                            </div>
                            <button
                                onClick={() => { toggleAlert('priceSpike'); toast(alerts.priceSpike ? 'Price spike alerts disabled' : 'Price spike alerts enabled'); }}
                                className={`w-11 h-6 rounded-full transition-colors relative ${alerts.priceSpike ? 'bg-green-500' : 'bg-muted'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${alerts.priceSpike ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Price Drops</p>
                                <p className="text-sm text-muted-foreground">Notify when a card drops &gt;15% in 24h</p>
                            </div>
                            <button
                                onClick={() => { toggleAlert('priceDrop'); toast(alerts.priceDrop ? 'Price drop alerts disabled' : 'Price drop alerts enabled'); }}
                                className={`w-11 h-6 rounded-full transition-colors relative ${alerts.priceDrop ? 'bg-green-500' : 'bg-muted'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${alerts.priceDrop ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Data Management */}
                <section className="bg-card border border-border/50 rounded-xl p-6 shadow-sm border-red-500/20">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-500">
                        ⚠️ Data Management
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                            <Download size={18} />
                            Export CSV
                        </button>
                        <button
                            onClick={handleClearData}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 size={18} />
                            Reset Portfolio
                        </button>
                    </div>
                </section>

            </div>
        </main>
    );
}
