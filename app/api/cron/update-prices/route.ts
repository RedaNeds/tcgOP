import { updateAllCardPrices } from '@/lib/actions/prices';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for Vercel functions (if applicable)

export async function GET(request: Request) {
    const startedAt = Date.now();
    try {
        const authHeader = request.headers.get('authorization');
        // Security:
        // - In production, CRON_SECRET is mandatory.
        // - In non-production, auth is enforced when CRON_SECRET is set.
        const cronSecret = process.env.CRON_SECRET;
        if (process.env.NODE_ENV === 'production' && !cronSecret) {
            console.error('CRON_SECRET is not set in production; price update endpoint is disabled.');
            return new NextResponse('Server misconfigured', { status: 500 });
        }

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const result = await updateAllCardPrices();

        const durationMs = Date.now() - startedAt;
        if (result.success) {
            console.log(`[cron/update-prices] success in ${durationMs}ms`);
        } else {
            console.error(`[cron/update-prices] failed in ${durationMs}ms`);
        }

        return NextResponse.json({
            ...result,
            requestDurationMs: durationMs,
            triggeredAt: new Date().toISOString(),
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[cron/update-prices] unhandled error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal Error',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
                requestDurationMs: Date.now() - startedAt,
                triggeredAt: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
