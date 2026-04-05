
import { Search } from 'lucide-react';
import Link from 'next/link';

export default function CardNotFound() {
    return (
        <main className="flex-1 md:ml-64 flex items-center justify-center p-8 pb-20 md:pb-8">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                    <Search className="text-muted-foreground" size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Card Not Found</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                    This card doesn&apos;t exist in our database.
                </p>
                <Link
                    href="/cards"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                    Browse Card Catalog
                </Link>
            </div>
        </main>
    );
}
