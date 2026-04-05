'use client';

import { useState, useEffect } from 'react';
import { CommandMenu } from '@/components/dashboard/CommandMenu';

interface DashboardShellProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}

export function DashboardShell({ children, sidebar }: DashboardShellProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsSearchOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        <div className="flex min-h-screen bg-background text-foreground relative">
            {sidebar}
            <div className="flex-1 flex flex-col min-w-0">
                {children}
            </div>
            <CommandMenu 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)} 
            />
        </div>
    );
}
