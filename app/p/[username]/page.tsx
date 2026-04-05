import { getPublicPortfolio } from '@/lib/actions/public-portfolio';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { PublicProfileClient } from './PublicProfileClient';

export const metadata = {
    title: 'Public Portfolio | OPTCG Tracker',
    description: 'View this collector\'s One Piece TCG Portfolio.',
};

export default async function PublicPortfolioPage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    const portfolio = await getPublicPortfolio(username);

    if (portfolio.status === 404 || portfolio.status === 403) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
                <ShieldAlert className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h1 className="text-2xl font-bold mb-2">Portfolio Not Available</h1>
                <p className="text-muted-foreground max-w-sm mb-8">
                    {portfolio.error || 'This portfolio is either private or does not exist.'}
                </p>
                <Link
                    href="/"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-medium transition-colors"
                >
                    Create Your Own Tracker
                </Link>
            </div>
        );
    }

    if (!portfolio.success || !portfolio.items) {
        return <div className="p-10 text-center text-white/50">Something went wrong.</div>;
    }

    const { user, items, wishlist } = portfolio;

    return (
        <PublicProfileClient 
            user={user} 
            items={items} 
            wishlist={wishlist || []}
            username={username} 
        />
    );
}
