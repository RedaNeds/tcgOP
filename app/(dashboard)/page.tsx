import { getPortfolioItems } from '@/lib/actions/portfolio';
import { getPortfolioHistory } from '@/lib/actions/history';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { auth } from '@/auth';


export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || 'Collector';

  const [items, historyData] = await Promise.all([
    getPortfolioItems(),
    getPortfolioHistory()
  ]);

  return (
    <main className="flex-1 md:ml-64 p-8 overflow-y-auto w-full pb-20 md:pb-8">
      <DashboardClient initialItems={items} historyData={historyData} userName={userName} />
    </main>
  );
}
