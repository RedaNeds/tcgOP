'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(data: { name?: string; username?: string; password?: string }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        const userId = session.user.id;

        // Prepare update payload
        const updateData: any = {};

        if (data.name !== undefined) updateData.name = data.name;

        // Handle username uniqueness check before updating
        if (data.username !== undefined && data.username.trim() !== '') {
            const trimmedUsername = data.username.trim();
            const existingUser = await prisma.user.findUnique({
                where: { username: trimmedUsername }
            });

            if (existingUser && existingUser.id !== userId) {
                return { success: false, error: 'Username is already taken' };
            }
            updateData.username = trimmedUsername;
        }

        // Handle password hashing if provided
        if (data.password && data.password.trim() !== '') {
            if (data.password.length < 6) {
                return { success: false, error: 'Password must be at least 6 characters' };
            }
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return { success: false, error: 'No data provided to update' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        revalidatePath('/settings');
        return { success: true };

    } catch (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}
