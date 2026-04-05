import { Metadata } from 'next';
import { getWishlistItems } from '@/lib/actions/wishlist';
import { WishlistClient } from './WishlistClient';

export const metadata: Metadata = {
    title: 'Wishlist - OPTCG Tracker',
    description: 'Track the One Piece TCG cards you want with target price alerts.',
};

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
    const items = await getWishlistItems();
    return <WishlistClient items={items} />;
}
