'use client';

import { LayoutDashboard, Wallet, TrendingUp, Settings, PieChart, Library, Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { label: 'Cards', icon: Library, href: '/cards' },
    { label: 'Wishlist', icon: Heart, href: '/wishlist' },
    { label: 'Portfolio', icon: Wallet, href: '/portfolio' },
    { label: 'Performance', icon: TrendingUp, href: '/performance' },
    { label: 'Allocation', icon: PieChart, href: '/allocation' },
    { label: 'Settings', icon: Settings, href: '/settings' },
];

const MOBILE_NAV_ITEMS = [
    { label: 'Home', icon: LayoutDashboard, href: '/' },
    { label: 'Cards', icon: Library, href: '/cards' },
    { label: 'Portfolio', icon: Wallet, href: '/portfolio' },
    { label: 'Wishlist', icon: Heart, href: '/wishlist' },
    { label: 'Settings', icon: Settings, href: '/settings' },
];

export function SidebarNav({ mobile }: { mobile?: boolean }) {
    const pathname = usePathname();

    if (mobile) {
        return (
            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex md:hidden justify-around items-center z-50 px-2 safe-area-bottom">
                {MOBILE_NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-lg transition-all",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            <item.icon size={20} className={cn(isActive && "fill-current/20")} />
                            <span className="text-[10px] font-medium mt-1">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        );
    }

    return (
        <nav className="space-y-1 flex-1">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                            isActive
                                ? "text-primary bg-secondary/50"
                                : "text-muted-foreground hover:text-primary hover:bg-secondary/30"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeNav"
                                className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <item.icon size={18} className={cn("transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
