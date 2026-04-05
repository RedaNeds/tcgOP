'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getBinders() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return prisma.binder.findMany({
        where: { userId: session.user.id },
        include: { items: { select: { id: true } } },
        orderBy: { createdAt: 'desc' }
    });
}

export async function createBinder(data: { name: string; description?: string; color?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        await prisma.binder.create({
            data: {
                ...data,
                userId: session.user.id
            }
        });
        revalidatePath('/app/portfolio');
        return { success: true };
    } catch (error) {
        console.error("Failed to create binder:", error);
        return { success: false, error: "Failed to create binder" };
    }
}

export async function updateBinder(id: string, data: { name?: string; description?: string; color?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        await prisma.binder.update({
            where: { id, userId: session.user.id },
            data
        });
        revalidatePath('/app/portfolio');
        return { success: true };
    } catch (error) {
        console.error("Failed to update binder:", error);
        return { success: false, error: "Failed to update binder" };
    }
}

export async function deleteBinder(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        await prisma.binder.delete({
            where: { id, userId: session.user.id }
        });
        revalidatePath('/app/portfolio');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete binder:", error);
        return { success: false, error: "Failed to delete binder" };
    }
}

export async function addItemsToBinder(binderId: string, itemIds: string[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        await prisma.binder.update({
            where: { id: binderId, userId: session.user.id },
            data: {
                items: {
                    connect: itemIds.map(id => ({ id }))
                }
            }
        });
        revalidatePath('/app/portfolio');
        return { success: true };
    } catch (error) {
        console.error("Failed to add items to binder:", error);
        return { success: false, error: "Failed to add items" };
    }
}

export async function removeItemsFromBinder(binderId: string, itemIds: string[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        await prisma.binder.update({
            where: { id: binderId, userId: session.user.id },
            data: {
                items: {
                    disconnect: itemIds.map(id => ({ id }))
                }
            }
        });
        revalidatePath('/app/portfolio');
        return { success: true };
    } catch (error) {
        console.error("Failed to remove items from binder:", error);
        return { success: false, error: "Failed to remove items" };
    }
}
