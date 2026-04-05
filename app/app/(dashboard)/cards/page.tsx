import { Metadata } from 'next';
import { getPaginatedCards, getCardFilters } from '@/lib/actions/cards';
import { CardsCatalogClient } from './CardsCatalogClient';

export const metadata: Metadata = {
    title: 'Card Catalog',
    description: 'Browse all One Piece TCG cards — filter by set, color, rarity, and type.',
};

export const dynamic = 'force-dynamic';

interface CardsPageProps {
    searchParams: Promise<{
        page?: string;
        q?: string;
        set?: string;
        color?: string;
        rarity?: string;
        type?: string;
    }>;
}

export default async function CardsPage({ searchParams }: CardsPageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || '1', 10);

    const [result, filters] = await Promise.all([
        getPaginatedCards({
            page,
            pageSize: 48,
            query: params.q,
            set: params.set,
            color: params.color,
            rarity: params.rarity,
            type: params.type,
        }),
        getCardFilters(),
    ]);

    return (
        <CardsCatalogClient
            key={`page-${result.page}-q-${params.q}-set-${params.set}-c-${params.color}-r-${params.rarity}-t-${params.type}`}
            cards={result.cards}
            filters={filters}
            totalCount={result.totalCount}
            currentPage={result.page}
            totalPages={result.totalPages}
            activeFilters={{
                q: params.q || '',
                set: params.set || '',
                color: params.color || '',
                rarity: params.rarity || '',
                type: params.type || '',
            }}
        />
    );
}
