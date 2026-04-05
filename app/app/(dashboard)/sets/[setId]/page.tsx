import { getSetProgress } from '@/lib/actions/set-progress';
import { SetProgressClient } from './SetProgressClient';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ setId: string }> }) {
    const { setId } = await params;
    return {
        title: `${decodeURIComponent(setId)} - Master Set | OPTCG Tracker`,
        description: `Track your progress towards completing the ${decodeURIComponent(setId)} master set.`,
    };
}

export default async function SetProgressPage({
    params,
}: {
    params: Promise<{ setId: string }>;
}) {
    const { setId } = await params;
    const decodedSetName = decodeURIComponent(setId);
    const data = await getSetProgress(decodedSetName);

    if ('error' in data) {
        return (
            <main className="flex-1 md:ml-64 p-8 flex flex-col items-center justify-center text-center opacity-80 min-h-[60vh]">
                <ShieldAlert className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h1 className="text-2xl font-bold mb-2">Error Loading Set</h1>
                <p className="text-muted-foreground max-w-sm mb-8">
                    {data.error}
                </p>
                <Link
                    href="/allocation"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-medium transition-colors"
                >
                    Return to Allocation
                </Link>
            </main>
        );
    }

    return (
        <SetProgressClient data={data} />
    );
}
