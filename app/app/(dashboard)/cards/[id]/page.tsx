import { Metadata } from 'next';
import { getCardById } from '@/lib/actions/cards';
import { getPortfolioItemsByCardId } from '@/lib/actions/portfolio';
import { CardDetailClient } from './CardDetailClient';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const card = await getCardById(id);
    if (!card) return { title: 'Card Not Found' };
    return {
        title: `${card.name} (${card.code})`,
        description: `${card.name} from ${card.set} — ${card.rarity}`,
    };
}

export default async function CardDetailPage({ params }: PageProps) {
    const { id } = await params;
    const [card, holdings] = await Promise.all([
        getCardById(id),
        getPortfolioItemsByCardId(id)
    ]);

    if (!card) notFound();
    return <CardDetailClient card={card} holdings={holdings} />;
}
