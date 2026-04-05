import { Search, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DashboardSortField = 'value' | 'pnl' | 'name' | 'dateAdded';

interface DashboardArsenalFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    sortField: DashboardSortField;
    setSortField: (value: DashboardSortField) => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (value: 'asc' | 'desc' | ((prev: 'asc' | 'desc') => 'asc' | 'desc')) => void;
    filterSet: string;
    setFilterSet: (value: string) => void;
    uniqueSets: string[];
}

export function DashboardArsenalFilters({
    search,
    setSearch,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    filterSet,
    setFilterSet,
    uniqueSets,
}: DashboardArsenalFiltersProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search arsenal by name, code or set..."
                    className="w-full glass rounded-2xl pl-12 pr-4 h-12 focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap gap-2">
                <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as DashboardSortField)}
                    className="glass rounded-2xl px-4 h-12 text-xs font-black focus:outline-none border-white/5 cursor-pointer appearance-none min-w-[140px]"
                >
                    <option value="value">Sort: Value</option>
                    <option value="pnl">Sort: Performance</option>
                    <option value="name">Sort: Name</option>
                    <option value="dateAdded">Sort: Date Added</option>
                </select>

                <select
                    value={filterSet}
                    onChange={(e) => setFilterSet(e.target.value)}
                    className="glass rounded-2xl px-4 h-12 text-xs font-black focus:outline-none border-white/5 cursor-pointer appearance-none min-w-[140px]"
                >
                    <option value="All">All Sets</option>
                    {uniqueSets.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>

                <button
                    onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="glass rounded-2xl px-4 h-12 flex items-center justify-center hover:bg-secondary/40 transition-colors border border-white/5"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                    <TrendingUp className={cn('h-4 w-4 transition-transform', sortOrder === 'asc' && 'rotate-180')} />
                </button>
            </div>
        </div>
    );
}
