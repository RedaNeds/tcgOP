'use client';


import { AllocationData } from '@/lib/actions/allocation';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface AllocationClientProps {
    data: AllocationData;
}

const CustomTooltip = ({ active, payload, totalValue }: { active?: boolean; payload?: any[]; totalValue?: number }) => {
    if (active && payload && payload.length && totalValue) {
        return (
            <div className="bg-popover border border-border p-2 rounded shadow-lg text-sm">
                <p className="font-bold">{payload[0].name}</p>
                <p className="text-muted-foreground">
                    ${payload[0].value.toFixed(2)} ({((payload[0].value / totalValue) * 100).toFixed(1)}%)
                </p>
            </div>
        );
    }
    return null;
};

export function AllocationClient({ data }: AllocationClientProps) {
    const { bySet, byColor, byType, byRarity, totalValue } = data;

    if (totalValue === 0) {
        return (
            <main className="flex-1 md:ml-64 p-8 flex flex-col items-center justify-center text-center opacity-60">
                <h1 className="text-3xl font-bold mb-4">No Data Available</h1>
                <p>Add cards to your portfolio to see allocation metrics.</p>
            </main>
        );
    }

    return (
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto w-full pb-20 md:pb-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Allocation</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Analyze your portfolio diversification and exposure.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* By Set (Donut) */}
                <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-6">By Set</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={bySet}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {bySet.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip totalValue={totalValue} />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap gap-3 justify-center">
                        {bySet.map(entry => (
                            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-muted-foreground">{entry.name}</span>
                                <span className="font-medium">{((entry.value / totalValue) * 100).toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* By Color (Pie) */}
                <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-6">By Color</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={byColor}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                >
                                    {byColor.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip totalValue={totalValue} />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 justify-center">
                        {byColor.map(entry => (
                            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-muted-foreground">{entry.name}</span>
                                <span className="font-medium">{((entry.value / totalValue) * 100).toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* By Type (Bar) */}
                <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-6">By Card Type</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byType} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#334155', opacity: 0.2 }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Value']}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* By Rarity (Bar) */}
                <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-6">By Rarity</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byRarity} margin={{ top: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#334155', opacity: 0.2 }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Value']}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Insights Section */}
            <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-primary/20 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    💡 Smart Insights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mock Insights for now - future phase will generate these dynamically */}
                    <div className="bg-card/50 p-4 rounded-lg flex gap-3 items-start border border-border/50">
                        <div className="bg-yellow-500/20 p-2 rounded text-yellow-500">
                            ⚠️
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Concentration Risk</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {(bySet[0]?.value / totalValue * 100).toFixed(0)}% of your portfolio is in <strong>{bySet[0]?.name}</strong>. Consider diversifying into other sets.
                            </p>
                        </div>
                    </div>
                    <div className="bg-card/50 p-4 rounded-lg flex gap-3 items-start border border-border/50">
                        <div className="bg-green-500/20 p-2 rounded text-green-500">
                            📈
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Top Performer</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Your <strong>Alternative Art</strong> cards have outperformed the market index by 12% this month.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}
