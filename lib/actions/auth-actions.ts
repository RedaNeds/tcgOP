'use server';

import { signIn, signOut } from '@/auth';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';

export async function register(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!username || !password || !confirmPassword) {
        return { error: 'All fields are required.' };
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match.' };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return { error: 'Username already taken.' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name: username, // Default name to username
            },
        });

        // Auto login after register? Or redirect to login? 
        // Let's redirect to login for simplicity or try to sign in directly.
        // For now, return success.
        return { success: true };

    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Something went wrong.' };
    }
}

export async function login(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'All fields are required.' };
    }

    try {
        await signIn('credentials', {
            username,
            password,
            redirectTo: '/',
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid credentials.' };
                default:
                    return { error: 'Something went wrong.' };
            }
        }
        throw error;
    }
}

export async function handleSignOut() {
    await signOut({ redirectTo: '/login' });
}
