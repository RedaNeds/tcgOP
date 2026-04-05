'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/lib/settings-store';

const DEFAULT_RATES: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    JPY: 150.0,
};

const CURRENCY_CONFIG: Record<string, { symbol: string; locale: string }> = {
    USD: { symbol: '$', locale: 'en-US' },
    EUR: { symbol: '€', locale: 'fr-FR' },
    JPY: { symbol: '¥', locale: 'ja-JP' },
};

export function useCurrency() {
    const { currency } = useSettingsStore();
    const [rates, setRates] = useState<Record<string, number>>(() => {
        const cached = typeof window !== 'undefined' ? localStorage.getItem('optcg_exchange_rates') : null;
        if (cached) {
            try {
                const { rates: cachedRates, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < 12 * 60 * 60 * 1000) {
                    return cachedRates;
                }
            } catch {
                // ignore
            }
        }
        return DEFAULT_RATES;
    });
    const [lastUpdated, setLastUpdated] = useState<number | null>(() => {
        const cached = typeof window !== 'undefined' ? localStorage.getItem('optcg_exchange_rates') : null;
        if (cached) {
            try {
                const { timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < 12 * 60 * 60 * 1000) {
                    return timestamp;
                }
            } catch {
                // ignore
            }
        }
        return null;
    });

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await fetch('https://open.er-api.com/v6/latest/USD');
                const data = await res.json();
                if (data && data.rates) {
                    const newRates = {
                        USD: 1,
                        EUR: data.rates.EUR || DEFAULT_RATES.EUR,
                        JPY: data.rates.JPY || DEFAULT_RATES.JPY,
                    };
                    setRates(newRates);
                    setLastUpdated(Date.now());
                    localStorage.setItem('optcg_exchange_rates', JSON.stringify({
                        rates: newRates,
                        timestamp: Date.now()
                    }));
                }
            } catch (e) {
                console.error("Failed to fetch rates", e);
            }
        };

        fetchRates();
    }, []);

    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
    const rate = rates[currency] || rates.USD;

    const format = (usdAmount: number): string => {
        const converted = usdAmount * rate;
        // JPY has no decimal places
        const decimals = currency === 'JPY' ? 0 : 2;
        return `${config.symbol}${converted.toFixed(decimals)}`;
    };

    const convert = (usdAmount: number): number => {
        return usdAmount * rate;
    };

    return { 
        format, 
        convert, 
        currency, 
        symbol: config.symbol, 
        rate,
        lastUpdated
    };
}
