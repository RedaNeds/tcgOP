
import { Metadata } from 'next';
import { getPortfolioItems } from '@/lib/actions/portfolio';
import { getBinders } from '@/lib/actions/binders';
import { PortfolioClient } from './PortfolioClient';

export const metadata: Metadata = {
    title: 'My Portfolio - OPTCG Tracker',
    description: 'Manage and track your entire One Piece TCG collection in one place.',
};

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { PortfolioSkeleton } from '@/components/dashboard/PortfolioSkeleton';

export default async function PortfolioPage() {
  const items = await getPortfolioItems();
  const binders = await getBinders();

  return (
    <Suspense fallback={<PortfolioSkeleton />}>
        <PortfolioClient initialItems={items} initialBinders={binders} />
    </Suspense>
  );
}
