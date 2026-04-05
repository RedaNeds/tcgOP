'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from "@/auth";

export interface AlertPreferences {
    alertPriceSpike: boolean;
    alertPriceDrop: boolean;
    alertMilestones: boolean;
}

export async function getAlertPreferences(): Promise<AlertPreferences> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { alertPriceSpike: false, alertPriceDrop: false, alertMilestones: false };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                alertPriceSpike: true,
                alertPriceDrop: true,
                alertMilestones: true,
            }
        });

        if (!user) return { alertPriceSpike: true, alertPriceDrop: true, alertMilestones: true };

        return {
            alertPriceSpike: user.alertPriceSpike,
            alertPriceDrop: user.alertPriceDrop,
            alertMilestones: user.alertMilestones,
        };
    } catch (error) {
        console.error('Failed to fetch alert preferences:', error);
        return { alertPriceSpike: true, alertPriceDrop: true, alertMilestones: true };
    }
}


export async function updateAlertPreferences(prefs: Partial<AlertPreferences>) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(prefs.alertPriceSpike !== undefined && { alertPriceSpike: prefs.alertPriceSpike }),
                ...(prefs.alertPriceDrop !== undefined && { alertPriceDrop: prefs.alertPriceDrop }),
                ...(prefs.alertMilestones !== undefined && { alertMilestones: prefs.alertMilestones }),
            }
        });

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Failed to update alert preferences:', error);
        return { success: false, error: "Failed to update preferences" };
    }
}

export async function updatePublicVisibility(isPublic: boolean) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { isPublic },
        });

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Failed to update public visibility:', error);
        return { success: false, error: 'Failed to update visibility' };
    }
}

export async function savePushSubscription(subscription: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const { endpoint, keys } = subscription;
        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return { success: false, error: "Invalid subscription data" };
        }

        await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                userId: session.user.id,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
            create: {
                userId: session.user.id,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to save push subscription:', error);
        return { success: false, error: "Failed to save subscription" };
    }
}

export async function deletePushSubscription(endpoint: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        await prisma.pushSubscription.deleteMany({
            where: { 
                endpoint,
                userId: session.user.id
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to delete push subscription:', error);
        return { success: false, error: "Failed to delete subscription" };
    }
}
