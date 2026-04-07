'use server';

import { signIn, signOut } from '@/auth';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { registerSchema, loginSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export async function register(prevState: any, formData: FormData) {
    const raw = {
        username: formData.get('username') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
    };

    // Rate limit by username
    const rl = checkRateLimit(raw.username || 'unknown', 'auth');
    if (!rl.success) {
        return { error: 'Too many attempts. Please try again later.' };
    }

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        return { error: firstError.message };
    }

    const { username, password } = parsed.data;

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
                name: username,
            },
        });

        return { success: true };

    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Something went wrong.' };
    }
}

export async function login(prevState: any, formData: FormData) {
    const raw = {
        username: formData.get('username') as string,
        password: formData.get('password') as string,
    };

    // Rate limit by username
    const rl = checkRateLimit(raw.username || 'unknown', 'auth');
    if (!rl.success) {
        return { error: 'Too many attempts. Please try again later.' };
    }

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    try {
        await signIn('credentials', {
            username: parsed.data.username,
            password: parsed.data.password,
            redirectTo: '/app',
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
