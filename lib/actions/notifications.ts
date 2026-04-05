'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from "@/auth";

export interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    cardId: string | null;
    isRead: boolean;
    link: string | null;
    createdAt: string;
}

export async function getNotifications(): Promise<NotificationItem[]> {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50, // Keep it sane for the UI
        });

        return notifications.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            cardId: n.cardId,
            isRead: n.isRead,
            link: n.link,
            createdAt: n.createdAt.toISOString(),
        }));
    } catch (error) {
        console.error('Failed to get notifications:', error);
        return [];
    }
}

export async function markAsRead(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const notification = await prisma.notification.findUnique({
            where: { id }
        });

        if (!notification || notification.userId !== session.user.id) {
            return { success: false, error: "Not found or unauthorized" };
        }

        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        return { success: false, error: "Failed to mark as read" };
    }
}

export async function markAllAsRead() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                isRead: false
            },
            data: { isRead: true }
        });

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to mark all as read:', error);
        return { success: false, error: "Failed to mark all as read" };
    }
}

export async function deleteNotification(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const notification = await prisma.notification.findUnique({
            where: { id }
        });

        if (!notification || notification.userId !== session.user.id) {
            return { success: false, error: "Not found or unauthorized" };
        }

        await prisma.notification.delete({
            where: { id }
        });

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete notification:', error);
        return { success: false, error: "Failed to delete" };
    }
}
