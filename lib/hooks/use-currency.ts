'use client';

import { useSettingsStore } from '@/lib/settings-store';

const CURRENCY_CONFIG: Record<string, { symbol: string; rate: number; locale: string }> = {
    USD: { symbol: '$', rate: 1, locale: 'en-US' },
    EUR: { symbol: '€', rate: 0.92, locale: 'fr-FR' },
    JPY: { symbol: '¥', rate: 149.50, locale: 'ja-JP' },
};

export function useCurrency() {
    const { currency } = useSettingsStore();
    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;

    const format = (usdAmount: number): string => {
        const converted = usdAmount * config.rate;
        // JPY has no decimal places
        const decimals = currency === 'JPY' ? 0 : 2;
        return `${config.symbol}${converted.toFixed(decimals)}`;
    };

    const convert = (usdAmount: number): number => {
        return usdAmount * config.rate;
    };

    return { format, convert, currency, symbol: config.symbol, rate: config.rate };
}
