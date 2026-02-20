import { Metadata } from 'next';
import { getPerformanceData } from '@/lib/actions/performance';
import { PerformanceClient } from './PerformanceClient';

export const metadata: Metadata = {
    title: 'Performance',
    description: 'Track your One Piece TCG portfolio value over time with charts and top movers.',
};

export const dynamic = 'force-dynamic';

export default async function PerformancePage() {
    const data = await getPerformanceData();

    return (
        <PerformanceClient initialData={data} />
    );
}
