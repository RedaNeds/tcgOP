'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';
import { format } from 'date-fns';

export async function exportPortfolioCSV(): Promise<string> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Not authenticated');

    const items = await prisma.portfolioItem.findMany({
        where: { userId: session.user.id },
        include: { card: true },
        orderBy: [{ card: { set: 'asc' } }, { card: { code: 'asc' } }],
    });

    const headers = [
        'Code',
        'Name',
        'Set',
        'Rarity',
        'Quantity',
        'Purchase Price',
        'Current Price',
        'Total Cost',
        'Total Value',
        'P&L',
        'P&L %',
        'Condition',
        'Language',
        'Graded',
        'Grading Company',
        'Cert ID',
        'For Trade',
        'Date Added',
    ];

    const escape = (val: string) => {
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
    };

    const rows = items.map(item => {
        const totalCost = item.quantity * item.purchasePrice;
        const totalValue = item.quantity * item.card.currentPrice;
        const pnl = totalValue - totalCost;
        const pnlPercent = totalCost > 0 ? ((pnl / totalCost) * 100).toFixed(1) : '0.0';

        return [
            item.card.code,
            escape(item.card.name),
            escape(item.card.set),
            item.card.rarity,
            item.quantity.toString(),
            item.purchasePrice.toFixed(2),
            item.card.currentPrice.toFixed(2),
            totalCost.toFixed(2),
            totalValue.toFixed(2),
            pnl.toFixed(2),
            pnlPercent + '%',
            item.condition,
            item.language,
            item.isGraded ? 'Yes' : 'No',
            item.gradingCompany || '',
            item.certId || '',
            item.isForTrade ? 'Yes' : 'No',
            format(item.purchasedAt, 'yyyy-MM-dd'),
        ].join(',');
    });

    // Summary row
    const totalCost = items.reduce((s, i) => s + i.quantity * i.purchasePrice, 0);
    const totalValue = items.reduce((s, i) => s + i.quantity * i.card.currentPrice, 0);
    const totalPnl = totalValue - totalCost;
    const totalPnlPct = totalCost > 0 ? ((totalPnl / totalCost) * 100).toFixed(1) : '0.0';

    rows.push(''); // empty row
    rows.push([
        '', 'TOTAL', '', '',
        items.reduce((s, i) => s + i.quantity, 0).toString(),
        '', '',
        totalCost.toFixed(2),
        totalValue.toFixed(2),
        totalPnl.toFixed(2),
        totalPnlPct + '%',
        '', '', '', '', '', '',
        format(new Date(), 'yyyy-MM-dd'),
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
}
