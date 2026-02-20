import { updateAllCardPrices } from '@/lib/actions/prices';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for Vercel functions (if applicable)

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        // Simple security: Check for a secret if deployed, or allow generic access in dev
        // For now, allow open access in dev
        if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const result = await updateAllCardPrices();

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
    }
}
