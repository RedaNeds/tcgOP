# Technical Architecture & Refactoring Guide

This document outlines the core architectural patterns and performance standards established during the Phase 4 modernization of the OPTCG Tracker. All future modifications should adhere to these principles to maintain consistency and low technical debt.

## 1. Centralized Business Logic
All financial calculations (P&L, growth, aggregation) must be centralized.
- **Location**: [`lib/utils/calculations.ts`](file:///c:/Users/redad/Projets/tcgOP-main/tcgOP-main/lib/utils/calculations.ts)
- **Guideline**: Do not implement inline math for P&L in components. Always use `calculatePnL` or `aggregatePnL`.
- **Reasoning**: Ensures a "Single Source of Truth" across the Dashboard, Portfolio, and Performance views.

## 2. Server/Client Boundary Strategy
To keep the application fast and SEO-friendly, we follow a specific layout pattern.
- **Pattern**: `DashboardLayout` (Server) -> `DashboardShell` (Client) -> `Children` (Server).
- **Execution**: 
    - The `layout.tsx` is a Server Component to allow async fetching/auth.
    - Interactive elements (hotkeys, modals, state) are wrapped in `DashboardShell.tsx`.
    - Components like `Sidebar` and `UserProfile` remain Server Components to avoid unnecessary client-side hydration.
- **Critical Fix**: See [`DashboardShell.tsx`](file:///c:/Users/redad/Projets/tcgOP-main/tcgOP-main/components/dashboard/DashboardShell.tsx) for reference.

## 3. Shared Hooks for State Management
Complex UI logic (filtering, sorting, searching) should be extracted from components.
- **Location**: [`lib/hooks/use-portfolio-filters.ts`](file:///c:/Users/redad/Projets/tcgOP-main/tcgOP-main/lib/hooks/use-portfolio-filters.ts)
- **Guideline**: If a component exceeds 300 lines, extract its state and logic into a custom hook. 
- **Benefit**: Improved testability and significant reduction in component boilerplate (e.g., `PortfolioClient.tsx` reduced from 1270 to ~400 lines).

## 4. Performance Standards (Hydration & CLS)
We prioritize "Perceived Performance" and Bundle Size optimization.
- **Dynamic Imports**: Use `next/dynamic` for all heavy modals and charting libraries (e.g., `recharts`).
- **Skeleton Screens**: Every major dashboard view must have a corresponding `Skeleton` component (e.g., `PortfolioSkeleton.tsx`) to eliminate Cumulative Layout Shift (CLS).
- **Suspense Transitions**: Wrap data-heavy client components in `<Suspense fallback={<Skeleton />}>` at the page level.

## 5. Component Modularity
- Large views are split into functional sub-components:
    - `PortfolioStats`: Only responsible for metrics cards.
    - `PortfolioGridItem`: Only responsible for a single asset card.
    - `PortfolioTable`: Tabular view of assets.

---
*Created by Antigravity during the Phase 4 Refactoring session.*
