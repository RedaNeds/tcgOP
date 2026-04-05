import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must be at most 100 characters'),
    confirmPassword: z
        .string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

// Portfolio schemas
export const addToPortfolioSchema = z.array(z.object({
    cardId: z.string().min(1, 'Card ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(9999),
    purchasePrice: z.number().min(0, 'Price must be positive').max(1000000),
    condition: z.string().default('Raw'),
    language: z.string().default('EN'),
    isGraded: z.boolean().default(false),
    certId: z.string().optional().nullable(),
    gradingCompany: z.string().optional().nullable(),
})).min(1, 'At least one item is required');

export const updatePortfolioItemSchema = z.object({
    quantity: z.number().int().min(1).max(9999).optional(),
    purchasePrice: z.number().min(0).max(1000000).optional(),
    condition: z.string().optional(),
    language: z.string().optional(),
    isGraded: z.boolean().optional(),
    isForTrade: z.boolean().optional(),
    certId: z.string().optional().nullable(),
    gradingCompany: z.string().optional().nullable(),
});

// Wishlist schemas
export const addToWishlistSchema = z.object({
    cardId: z.string().min(1),
    targetPrice: z.number().min(0.01, 'Target price must be positive').max(100000),
    notes: z.string().max(500).optional(),
});

// Profile schemas
export const updateProfileSchema = z.object({
    name: z.string().max(50).optional(),
    username: z
        .string()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9_-]+$/)
        .optional(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100)
        .optional()
        .or(z.literal('')),
});

// Type exports for use in server actions
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddToPortfolioInput = z.infer<typeof addToPortfolioSchema>;
export type UpdatePortfolioItemInput = z.infer<typeof updatePortfolioItemSchema>;
export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
