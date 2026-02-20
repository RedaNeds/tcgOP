import { Metadata } from 'next';
import { getWishlistItems } from '@/lib/actions/wishlist';
import { WishlistClient } from './WishlistClient';

export const metadata: Metadata = {
    title: 'Wishlist',
    description: 'Track cards you want to buy and set target prices for alerts.',
};

export default async function WishlistPage() {
    const items = await getWishlistItems();
    return <WishlistClient items={items} />;
}
