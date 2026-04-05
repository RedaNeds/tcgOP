import { Metadata } from 'next';
import { getAllocationData } from '@/lib/actions/allocation';
import { AllocationClient } from './AllocationClient';

export const metadata: Metadata = {
    title: 'Asset Allocation - OPTCG Tracker',
    description: 'Visualize your One Piece TCG portfolio by set, color, rarity, and card type.',
};

export const dynamic = 'force-dynamic';

export default async function AllocationPage() {
    const data = await getAllocationData();

    return (
        <AllocationClient data={data} />
    );
}
