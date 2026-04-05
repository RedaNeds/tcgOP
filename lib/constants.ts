/**
 * Shared constants for the OPTCG Tracker application.
 * Single source of truth for colors, grades, languages, and card statuses.
 */

export const SET_COLORS: Record<string, string> = {
    'Romance Dawn': '#fbbf24',
    'Awakening of the New Era': '#f97316',
    'Straw Hat Crew': '#22c55e',
    'Paramount War': '#ef4444',
    'Pillars of Strength': '#a855f7',
    'Kingdoms of Intrigue': '#3b82f6',
    'Twin Champions': '#06b6d4',
    'The Three Captains': '#ec4899',
};

export const COLOR_MAP: Record<string, string> = {
    'Red': '#ef4444',
    'Green': '#22c55e',
    'Blue': '#3b82f6',
    'Purple': '#a855f7',
    'Black': '#1f2937',
    'Yellow': '#eab308',
    'Red/Green': '#d97706',
    'Red/Black': '#7f1d1d',
    'Blue/Purple': '#6366f1',
    'Red/Yellow': '#f59e0b',
};

export const GRADE_OPTIONS = [
    { value: '10', label: '10 (Pristine/Gem Mint)' },
    { value: '9.5', label: '9.5 (Mint+)' },
    { value: '9', label: '9 (Mint)' },
    { value: '8.5', label: '8.5 (NM-MT+)' },
    { value: '8', label: '8 (NM-MT)' },
    { value: '7', label: '7 (NM)' },
    { value: '6', label: '6 (EX-MT)' },
    { value: '5', label: '5 (EX)' },
    { value: '4', label: '4 (VG-EX)' },
    { value: '3', label: '3 (VG)' },
    { value: '2', label: '2 (Good)' },
    { value: '1', label: '1 (Poor)' },
] as const;

export const LANGUAGE_OPTIONS = [
    { value: 'EN', label: 'English' },
    { value: 'JP', label: 'Japanese' },
    { value: 'FR', label: 'French' },
    { value: 'IT', label: 'Italian' },
] as const;

export const CARD_STATUS_OPTIONS = [
    { value: 'Raw', label: 'Raw (Ungraded)' },
    { value: 'Graded', label: 'Graded' },
    { value: 'Sealed', label: 'Sealed Product' },
] as const;

export const GRADING_COMPANY_OPTIONS = [
    { value: 'PSA', label: 'PSA' },
    { value: 'BGS', label: 'Beckett (BGS)' },
    { value: 'CGC', label: 'CGC' },
    { value: 'PCG', label: 'PCG' },
    { value: 'Other', label: 'Other' },
] as const;

export function getSetColor(set: string): string {
    return SET_COLORS[set] || '#6b7280';
}
