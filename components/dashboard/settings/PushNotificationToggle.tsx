'use client';

import { useEffect, useState } from 'react';
import { Bell, Loader2, Info } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { savePushSubscription, deletePushSubscription } from '@/lib/actions/user-settings';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function PushNotificationToggle() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const { toast } = useToast();

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
            checkSubscription();
        }
    }, []);

    async function checkSubscription() {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
    }

    async function subscribe() {
        setIsPending(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Request permission
            const result = await Notification.requestPermission();
            setPermission(result);
            
            if (result !== 'granted') {
                toast('Notification permission denied', 'error');
                return;
            }

            if (!VAPID_PUBLIC_KEY) {
                console.error('VAPID Public Key missing');
                toast('Configuration error', 'error');
                return;
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: VAPID_PUBLIC_KEY,
            });

            const res = await savePushSubscription(JSON.parse(JSON.stringify(sub)));
            
            if (res.success) {
                setSubscription(sub);
                toast('Push notifications enabled', 'success');
            } else {
                toast(res.error || 'Failed to sync subscription', 'error');
            }
        } catch (error) {
            console.error('Push subscription failed:', error);
            toast('Failed to subscribe to notifications', 'error');
        } finally {
            setIsPending(false);
        }
    }

    async function unsubscribe() {
        if (!subscription) return;
        setIsPending(true);
        try {
            await subscription.unsubscribe();
            const res = await deletePushSubscription(subscription.endpoint);
            
            if (res.success) {
                setSubscription(null);
                toast('Push notifications disabled', 'success');
            } else {
                toast(res.error || 'Failed to remove subscription', 'error');
            }
        } catch (error) {
            console.error('Push unsubscription failed:', error);
            toast('Failed to unsubscribe', 'error');
        } finally {
            setIsPending(false);
        }
    }

    if (!isSupported) return null;

    const isEnabled = !!subscription;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-medium">Web Push Alerts</p>
                        {isEnabled ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20">
                                Active
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border">
                                Disabled
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">Receive real-time alerts even when the app is closed</p>
                </div>
                <button
                    onClick={isEnabled ? unsubscribe : subscribe}
                    disabled={isPending}
                    className={`w-11 h-6 rounded-full transition-colors relative ${isEnabled ? 'bg-blue-500' : 'bg-muted'} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isEnabled ? 'left-[22px]' : 'left-0.5'} flex items-center justify-center`}>
                        {isPending && <Loader2 size={10} className="animate-spin text-blue-500" />}
                    </div>
                </button>
            </div>

            {permission === 'denied' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3 text-xs text-red-500 animate-in fade-in slide-in-from-top-1">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <p>
                        Notifications are blocked in your browser settings. 
                        Please enable them to receive push alerts.
                    </p>
                </div>
            )}

            {isEnabled && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 text-xs text-blue-400 animate-in fade-in slide-in-from-top-1">
                    <Bell size={14} className="shrink-0 mt-0.5" />
                    <p>
                        You&apos;re all set! You&apos;ll receive push notifications for price spikes, drops, and wishlist targets.
                    </p>
                </div>
            )}
        </div>
    );
}
