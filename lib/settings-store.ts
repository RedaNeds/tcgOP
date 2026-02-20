import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    currency: 'USD' | 'EUR' | 'JPY';
    displayName: string;
    setCurrency: (currency: 'USD' | 'EUR' | 'JPY') => void;
    setDisplayName: (name: string) => void;
    // Alert preferences (local for now, sync to DB later)
    alerts: {
        priceSpike: boolean;
        priceDrop: boolean;
        milestones: boolean;
    };
    toggleAlert: (key: keyof SettingsState['alerts']) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            currency: 'USD',
            displayName: 'Guest User',
            setCurrency: (currency) => set({ currency }),
            setDisplayName: (displayName) => set({ displayName }),
            alerts: {
                priceSpike: true,
                priceDrop: true,
                milestones: true,
            },
            toggleAlert: (key) =>
                set((state) => ({
                    alerts: {
                        ...state.alerts,
                        [key]: !state.alerts[key],
                    },
                })),
        }),
        {
            name: 'one-piece-settings-storage',
        }
    )
);
