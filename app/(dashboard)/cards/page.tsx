import { Metadata } from 'next';
import { getAllCards, getCardFilters } from '@/lib/actions/cards';
import { CardsCatalogClient } from './CardsCatalogClient';

export const metadata: Metadata = {
    title: 'Card Catalog',
    description: 'Browse all One Piece TCG cards — filter by set, color, rarity, and type.',
};

export const dynamic = 'force-dynamic';

export default async function CardsPage() {
    const [cards, filters] = await Promise.all([
        getAllCards(),
        getCardFilters(),
    ]);

    return <CardsCatalogClient cards={cards} filters={filters} />;
}
