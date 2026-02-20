import { Metadata } from 'next';
import { getAllocationData } from '@/lib/actions/allocation';
import { AllocationClient } from './AllocationClient';

export const metadata: Metadata = {
    title: 'Allocation',
    description: 'Analyze your One Piece TCG portfolio diversification by set, color, type, and rarity.',
};

export const dynamic = 'force-dynamic';

export default async function AllocationPage() {
    const data = await getAllocationData();

    return (
        <AllocationClient data={data} />
    );
}
