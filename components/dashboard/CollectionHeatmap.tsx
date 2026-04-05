'use client';

import { useMemo } from 'react';
import { PortfolioItem } from '@/types';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { Layers } from 'lucide-react';
import { useCurrency } from '@/lib/hooks/use-currency';

interface CollectionHeatmapProps {
    items: PortfolioItem[];
}

// Recharts Custom Content for Treemap
const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, colors, name, percentage } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : '#ffffff00',
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {
                depth === 1 ? (
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + 7}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={14}
                        fontWeight="bold"
                    >
                        {width > 50 && height > 30 ? (name === 'SEC' ? 'Secret Rare (SEC)' : name === 'SR' ? 'Super Rare (SR)' : name) : ''}
                    </text>
                ) : null
            }
            {
                depth === 1 ? (
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + 25}
                        textAnchor="middle"
                        fill="#ffffff90"
                        fontSize={12}
                    >
                        {width > 50 && height > 50 ? `${percentage}%` : ''}
                    </text>
                ) : null
            }
        </g>
    );
};

export function CollectionHeatmap({ items }: CollectionHeatmapProps) {
    const { format } = useCurrency();

    // Group items by Rarity to build the Treemap hierarchy
    const heatmapData = useMemo(() => {
        if (!items || items.length === 0) return [];

        const totalValue = items.reduce((sum, item) => sum + ((item.currentPrice || 0) * item.quantity), 0);
        if (totalValue === 0) return [];

        const rarityMap: Record<string, { value: number; count: number, percentage: number }> = {};
        
        items.forEach(item => {
            const rarity = item.rarity || 'Unknown';
            // Simplify some common rarities for better UI grouping
            let group = rarity;
            if (rarity.includes('SEC')) group = 'SEC';
            else if (rarity.includes('SR')) group = 'SR';
            else if (rarity.includes('L') || rarity.includes('Lead')) group = 'Leader';
            else if (rarity.includes('R')) group = 'Rare';
            else if (rarity.includes('UC') || rarity.includes('C')) group = 'Common / UC';
            else if (rarity.includes('P') || rarity.includes('Promo')) group = 'Promo';

            if (!rarityMap[group]) rarityMap[group] = { value: 0, count: 0, percentage: 0 };
            
            const val = (item.currentPrice || 0) * item.quantity;
            rarityMap[group].value += val;
            rarityMap[group].count += item.quantity;
        });

        // Convert to Recharts Treemap format and sort by value
        const children = Object.entries(rarityMap)
            .filter(([, stats]) => stats.value > 0)
            .map(([name, stats]) => ({
                name,
                size: stats.value,
                count: stats.count,
                percentage: ((stats.value / totalValue) * 100).toFixed(1)
            }))
            .sort((a, b) => b.size - a.size);

        return [{
            name: 'Collection',
            children
        }];
    }, [items]);

    const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

    if (!items || items.length === 0 || !heatmapData[0]?.children?.length) return null;

    return (
        <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm mb-8 w-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Layers className="text-primary" size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Value by Rarity Heatmap</h3>
                        <p className="text-xs text-muted-foreground">Concentration of wealth across card types</p>
                    </div>
                </div>
            </div>

            <div className="w-full h-[300px] overflow-hidden rounded-lg border border-border/50 pt-2">
                <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
                    <Treemap
                        data={heatmapData}
                        dataKey="size"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        fill="#8884d8"
                        content={<CustomizedContent colors={COLORS} />}
                    >
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-background/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl">
                                            <p className="font-bold mb-1">{data.name}</p>
                                            <p className="text-sm">Total Value: <span className="font-bold text-green-500">{format(data.value)}</span></p>
                                            <p className="text-sm text-muted-foreground">{data.percentage}% of portfolio</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </Treemap>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
