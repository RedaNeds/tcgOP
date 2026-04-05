# Portfolio Redesign: The "Pro Max" Unified Experience
**Date:** March 27, 2026

## 1. Overview
The user requested an amalgamation of three major features to transform the Portfolio page from a simple data table into a powerful, Finary-like TCG asset management dashboard. The three pillars are: Visual Gallery (Grid View), Advanced Analytics (Charts), and Organizational Binders (Custom Folders).

## 2. Architectural Pillars

### Pillar A: The Analytics Dashboard ("L'Expérience Finary")
**Location:** Top of the page (replacing the current simple 3 stat cards).
**Components:**
1.  **Main Portfolio Chart**: A large `Recharts` AreaChart/LineChart showing the total portfolio value over time (if historical data exists) or a placeholder visually stunning chart if history isn't fully built out yet.
2.  **Allocation Donuts**: Two smaller `PieChart` components showing:
    *   **Value by Set**: E.g., Romance Dawn (40%), Awakening of the New Era (60%).
    *   **Value by Rarity**: E.g., SEC (50%), SR (30%), L (20%).
3.  **KPI Cards**: Total Value, Cost Basis, and Total PnL (re-styled to be ultra-premium glass cards).

### Pillar B: Custom Binders ("L'Expérience Classeur")
**Location:** Above or to the left of the card list.
**Feature Design:**
*   Users can organize their portfolio into "Binders" (which act like folders/tags).
*   **Default Binders**: `All Cards`, `For Trade` (auto-generated from `isForTrade`).
*   **Custom Binders**: Users can create custom binders (e.g., "To Grade PSA", "Zoro Deck", "Investment").
*   **Data Model Impact**: Requires a new `Binder` model linked to `User`, and a many-to-many relationship between `Binder` and `PortfolioItem`.
*   **UI Integration**: A sleek tab-bar or left-sidebar where selecting a binder instantly filters the view below.

### Pillar C: Immersive Grid View ("L'Expérience Collectionneur")
**Location:** The main data section.
**Feature Design:**
*   **View Toggle**: A switch (`<LayoutGrid />` vs `<List />`) allowing users to swap between the legacy Data Table and the new Grid View.
*   **Grid Content**:
    *   Responsive columns (2 on mobile, 4 on tablet, 6+ on desktop).
    *   Each grid item displays the high-res card image using the `<CardImage />` component.
    *   Hover effects show the card's current market price, PnL, and quantity owned.
    *   This is the primary way mobile users will interact with their portfolio, solving the cramped table issue.

## 3. Scope & Phasing
Because combining all three is a monumental update, it should be phased:
*   **Phase 1 (Visuals & Data):** Implement the View Toggle (Grid/Table) and the Analytics Dashboard (Allocation Donuts).
*   **Phase 2 (Architecture):** Implement the "Binders" system (requires Database Schema update).
