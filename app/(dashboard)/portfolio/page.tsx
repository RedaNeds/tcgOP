
import { Metadata } from 'next';
import { getPortfolioItems } from '@/lib/actions/portfolio';
import { PortfolioClient } from './PortfolioClient';

export const metadata: Metadata = {
    title: 'Portfolio',
    description: 'Manage your One Piece TCG card collection — view, sort, filter and track your holdings.',
};

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
    const items = await getPortfolioItems(); // Server-side fetch

    return (
        <PortfolioClient initialItems={items} />
    );
}
