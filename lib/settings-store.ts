import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    currency: 'USD' | 'EUR' | 'JPY';
    displayName: string;
    setCurrency: (currency: 'USD' | 'EUR' | 'JPY') => void;
    setDisplayName: (name: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            currency: 'USD',
            displayName: 'Guest User',
            setCurrency: (currency) => set({ currency }),
            setDisplayName: (displayName) => set({ displayName }),
        }),
        {
            name: 'one-piece-settings-storage',
        }
    )
);
