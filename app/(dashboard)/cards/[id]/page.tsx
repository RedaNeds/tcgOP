import { Metadata } from 'next';
import { getCardById } from '@/lib/actions/cards';
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
        description: `${card.name} from ${card.set} — ${card.rarity} • $${card.currentPrice.toFixed(2)}`,
    };
}

export default async function CardDetailPage({ params }: PageProps) {
    const { id } = await params;
    const card = await getCardById(id);
    if (!card) notFound();
    return <CardDetailClient card={card} />;
}
