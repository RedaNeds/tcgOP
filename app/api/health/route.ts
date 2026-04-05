import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    const start = Date.now();

    try {
        // Check DB connectivity
        await prisma.$queryRaw`SELECT 1`;
        const dbLatency = Date.now() - start;

        return NextResponse.json({
            status: 'ok',
            version: '0.1.0',
            uptime: process.uptime(),
            db: {
                status: 'connected',
                latencyMs: dbLatency,
            },
            timestamp: new Date().toISOString(),
        });
    } catch {
        return NextResponse.json(
            {
                status: 'error',
                db: { status: 'disconnected' },
                timestamp: new Date().toISOString(),
            },
            { status: 503 }
        );
    }
}
