'use client';


import { useSettingsStore } from '@/lib/settings-store';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun, Download, Trash2, Key, User, Globe, Copy } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useToast } from '@/components/ui/toast';
import { getPortfolioItems, resetPortfolio } from '@/lib/actions/portfolio';
import { updateUserProfile } from '@/lib/actions/user';
import { updateAlertPreferences, updatePublicVisibility } from '@/lib/actions/user-settings';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PushNotificationToggle } from '@/components/dashboard/settings/PushNotificationToggle';
import { Smartphone } from 'lucide-react';

interface SettingsClientProps {
    user: {
        name: string;
        username: string;
        email: string;
        alertPriceSpike: boolean;
        alertPriceDrop: boolean;
        alertMilestones: boolean;
        isPublic: boolean;
    };
}

export function SettingsClient({ user }: SettingsClientProps) {
    const { theme, setTheme } = useTheme();
    const { currency, setCurrency, setDisplayName } = useSettingsStore();
    const { toast } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Local state for UI responsiveness before server transition completes
    const [localAlerts, setLocalAlerts] = useState({
        priceSpike: user.alertPriceSpike,
        priceDrop: user.alertPriceDrop,
        milestones: user.alertMilestones
    });

    // Hydration fix
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Local profile state
    const [nameInput, setNameInput] = useState(user.name);
    const [usernameInput, setUsernameInput] = useState(user.username);
    const [passwordInput, setPasswordInput] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isPublicState, setIsPublicState] = useState(user.isPublic);

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

    const handleClearData = async () => {
        setShowResetConfirm(false);
        setIsResetting(true);
        try {
            const result = await resetPortfolio();
            if (result.success) {
                toast('All data has been reset', 'success');
                router.refresh();
            } else {
                toast(result.error || 'Failed to reset data', 'error');
            }
        } catch {
            toast('An error occurred while resetting', 'error');
        } finally {
            setIsResetting(false);
        }
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
        } catch {
            toast('An error occurred', 'error');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleToggleAlert = (key: 'priceSpike' | 'priceDrop' | 'milestones') => {
        const newValue = !localAlerts[key];
        setLocalAlerts(prev => ({ ...prev, [key]: newValue }));

        startTransition(async () => {
            const res = await updateAlertPreferences({
                ...(key === 'priceSpike' && { alertPriceSpike: newValue }),
                ...(key === 'priceDrop' && { alertPriceDrop: newValue }),
                ...(key === 'milestones' && { alertMilestones: newValue }),
            });
            if (res.success) {
                toast(`Alerts ${newValue ? 'enabled' : 'disabled'}`, 'success');
            } else {
                // Revert on failure
                setLocalAlerts(prev => ({ ...prev, [key]: !newValue }));
                toast('Failed to update preferences', 'error');
            }
        });
    };

    const handleTogglePublic = () => {
        const newValue = !isPublicState;
        setIsPublicState(newValue);
        
        startTransition(async () => {
            const res = await updatePublicVisibility(newValue);
            if (res.success) {
                toast(`Public Portfolio ${newValue ? 'enabled' : 'disabled'}`, 'success');
            } else {
                setIsPublicState(!newValue);
                toast('Failed to update visibility', 'error');
            }
        });
    };

    const copyPublicLink = () => {
        const url = `${window.location.protocol}//${window.location.host}/p/${user.username}`;
        navigator.clipboard.writeText(url);
        toast('Link copied to clipboard', 'success');
    };

    if (!mounted) return null;

    return (
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto pb-20 md:pb-8">
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

                {/* Public Portfolio Sharing */}
                <section className="bg-card border border-border/50 rounded-xl p-6 shadow-sm border-blue-500/20">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-500">
                        <Globe size={20} /> Public Portfolio
                    </h2>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Share your collection</p>
                                <p className="text-sm text-muted-foreground">Allow anyone with the link to view your portfolio (read-only)</p>
                            </div>
                            <button
                                onClick={handleTogglePublic}
                                disabled={isPending}
                                className={`w-11 h-6 rounded-full transition-colors relative ${isPublicState ? 'bg-blue-500' : 'bg-muted'} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isPublicState ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                        </div>

                        {isPublicState && (
                            <div className="mt-2 p-4 bg-muted/50 rounded-lg flex items-center justify-between gap-4 border border-border">
                                <div className="truncate text-sm text-foreground/80">
                                    {typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/p/${user.username}` : `.../p/${user.username}`}
                                </div>
                                <button
                                    onClick={copyPublicLink}
                                    className="flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors shrink-0"
                                >
                                    <Copy size={14} /> Copy Link
                                </button>
                            </div>
                        )}
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
                                onClick={() => handleToggleAlert('priceSpike')}
                                disabled={isPending}
                                className={`w-11 h-6 rounded-full transition-colors relative ${localAlerts.priceSpike ? 'bg-green-500' : 'bg-muted'} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${localAlerts.priceSpike ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Price Drops</p>
                                <p className="text-sm text-muted-foreground">Notify when a card drops &gt;15% in 24h</p>
                            </div>
                            <button
                                onClick={() => handleToggleAlert('priceDrop')}
                                disabled={isPending}
                                className={`w-11 h-6 rounded-full transition-colors relative ${localAlerts.priceDrop ? 'bg-green-500' : 'bg-muted'} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${localAlerts.priceDrop ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Milestones</p>
                                <p className="text-sm text-muted-foreground">Notify on target prices and important account updates</p>
                            </div>
                            <button
                                 onClick={() => handleToggleAlert('milestones')}
                                 disabled={isPending}
                                 className={`w-11 h-6 rounded-full transition-colors relative ${localAlerts.milestones ? 'bg-green-500' : 'bg-muted'} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                             >
                                 <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${localAlerts.milestones ? 'left-[22px]' : 'left-0.5'}`} />
                             </button>
                         </div>

                         {/* Web Push Toggle */}
                         <div className="pt-4 border-t border-border/50">
                             <PushNotificationToggle />
                         </div>

                         {/* Mobile/iOS Hint */}
                         <div className="p-4 bg-muted/30 rounded-xl flex gap-3 text-xs border border-border/30 mt-4">
                             <Smartphone size={16} className="shrink-0 text-blue-400 mt-0.5" />
                             <div>
                                 <p className="font-semibold text-foreground/90 flex items-center gap-1.5 mb-1">
                                     iOS User?
                                     <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest bg-muted px-1 rounded">Recommendation</span>
                                 </p>
                                 <p className="text-muted-foreground leading-relaxed">
                                     To enable push notifications on iPhone, please <strong>Add to Home Screen</strong> first via the Share menu (Safari), then return here to enable the toggle.
                                 </p>
                             </div>
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
                            onClick={() => setShowResetConfirm(true)}
                            disabled={isResetting}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={18} />
                            {isResetting ? 'Resetting...' : 'Reset Portfolio'}
                        </button>
                    </div>
                </section>

            </div>

            <ConfirmModal
                isOpen={showResetConfirm}
                title="Reset Portfolio"
                message="This will permanently delete ALL your portfolio items, wishlist items, and notifications. This action cannot be undone."
                confirmLabel="Delete Everything"
                variant="danger"
                onConfirm={handleClearData}
                onCancel={() => setShowResetConfirm(false)}
            />
        </main>
    );
}
