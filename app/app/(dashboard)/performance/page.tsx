import { Metadata } from 'next';
import { getPerformanceData } from '@/lib/actions/performance';
import { PerformanceClient } from './PerformanceClient';

export const metadata: Metadata = {
    title: 'Performance - OPTCG Tracker',
    description: 'Detailed insights on profit, loss, top movers, and risks for your One Piece TCG portfolio.',
};

export const dynamic = 'force-dynamic';

export default async function PerformancePage() {
    const data = await getPerformanceData();

    return (
        <PerformanceClient initialData={data} />
    );
}
