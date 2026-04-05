# Technical Specification: Master Collection Expansion (2026-03-14)

## Overview
This specification outlines the expansion of the One Piece TCG Tracker to include advanced collection tracking, market performance analytics, and social trading features.

## 1. Set Mastery Hub
**Objective**: Provide a detailed progress view for each set, distinguishing between core cards and high-rarity variations.

### Features
- **Dual Progress Metrics**: 
    - `Core Completion`: Percentage of unique card base codes collected (e.g., 100/100).
    - `Mastery Completion`: Percentage of unique card IDs (including Alts/Parallel Rares) collected.
- **Visual Checklist Grid**: 
    - Grouped by set.
    - Status indicators: `Owned` (Color), `Missing` (Greyscale/Faded).
    - "Mastery" toggle to show/hide parallel rares.

### Data Model Changes
- No immediate schema changes for `Card`. The logic will be handled by filtering `code` (base) vs `id` (unique variation).

---

## 2. Market Timing Index
**Objective**: Analyze purchase efficiency by comparing cost basis against historical market lows.

### Metrics Calculation
- `Timing Score` = `(PurchasePrice - HistoricalLow) / (CurrentPrice - HistoricalLow)` (normalized index).
- **Badge Logic**:
    - **Diamond Hand**: `PurchasePrice` within 10% of `PriceHistory.min()`.
    - **FOMO**: `PurchasePrice` > `PriceHistory.avg() * 1.3`.

### UI Integration
- Add "Timing Badges" to the Portfolio table.
- New dashboard widget: "Average Portfolio Timing Score".

---

## 3. Trading Billboard
**Objective**: Transform public profiles into actionable trading tools.

### Features
- **Public "Haves"**: A section on the public profile showing `PortfolioItems` flagged for trade.
- **Public "Wants"**: A section showing the user's `WishlistItems`.
- **Trading Summary Card**: A small, shareable UI component summarizing the top 5 "Haves" and "Wants".

### Data Model Changes
- **PortfolioItem**: Add `isForTrade` (Boolean, default: false).
- **User**: Add `tradingBio` (String, optional).

---

## Technical Approach
- **Frontend**: Next.js 16 (App Router), Framer Motion for transitions, Recharts for analytics.
- **Backend**: Prisma/PostgreSQL for data storage, server actions for logical updates.
- **API**: Extend `/api/sets/[setId]` to return completion stats.
