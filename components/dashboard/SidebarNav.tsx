'use client';

import { 
    LayoutDashboard, 
    Wallet, 
    TrendingUp, 
    Settings, 
    PieChart, 
    Library, 
    Heart, 
    Search
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/app' },
    { label: 'Cards', icon: Library, href: '/app/cards' },
    { label: 'Wishlist', icon: Heart, href: '/app/wishlist' },
    { label: 'Portfolio', icon: Wallet, href: '/app/portfolio' },
    { label: 'Performance', icon: TrendingUp, href: '/app/performance' },
    { label: 'Allocation', icon: PieChart, href: '/app/allocation' },
    { label: 'Settings', icon: Settings, href: '/app/settings' },
];

const MOBILE_NAV_ITEMS = [
    { label: 'Home', icon: LayoutDashboard, href: '/app' },
    { label: 'Cards', icon: Library, href: '/app/cards' },
    { label: 'Portfolio', icon: Wallet, href: '/app/portfolio' },
    { label: 'Wishlist', icon: Heart, href: '/app/wishlist' },
    { label: 'Settings', icon: Settings, href: '/app/settings' },
];

export function SidebarNav({ mobile }: { mobile?: boolean }) {
    const pathname = usePathname();

    if (mobile) {
        return (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm md:hidden z-[100]">
                <nav className="glass-dark border border-white/10 rounded-3xl p-2 px-4 shadow-2xl flex justify-between items-center marine-glow">
                    {MOBILE_NAV_ITEMS.slice(0, 2).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2 transition-all duration-300 relative",
                                    isActive ? "text-blue-400" : "text-muted-foreground"
                                )}
                            >
                                <item.icon size={20} className={cn(isActive && "scale-110")} />
                                <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{item.label}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="mobileNavActive"
                                        className="absolute -top-1 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                                    />
                                )}
                            </Link>
                        );
                    })}

                    {/* Central Quick Search/Add Button */}
                    <button 
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                        className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 -translate-y-6 border-4 border-[#0a0a0a] active:scale-90 transition-transform"
                    >
                        <Search size={24} strokeWidth={3} />
                    </button>

                    {MOBILE_NAV_ITEMS.slice(2, 4).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2 transition-all duration-300 relative",
                                    isActive ? "text-blue-400" : "text-muted-foreground"
                                )}
                            >
                                <item.icon size={20} className={cn(isActive && "scale-110")} />
                                <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{item.label}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="mobileNavActive"
                                        className="absolute -top-1 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        );
    }

    return (
        <nav className="space-y-2 flex-1">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group relative",
                            isActive
                                ? "text-blue-400 bg-blue-400/10 shadow-lg shadow-blue-400/5 marine-glow"
                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeNav"
                                className="absolute left-0 w-1.5 h-5 bg-blue-400 rounded-r-full shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <item.icon size={18} className={cn("transition-all duration-300", isActive ? "text-blue-400 scale-110" : "group-hover:text-white group-hover:scale-110")} />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
