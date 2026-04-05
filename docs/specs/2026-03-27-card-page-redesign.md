# Card Page Redesign: "Pro Max" Split View
**Date:** March 27, 2026
**Focus:** Visual Immersion (Gaming) + Financial Hub (Data)
**Target File:** `app/app/(dashboard)/cards/[id]/CardDetailClient.tsx`

## 1. Overview & Architecture
The new card details page will drop the standard top-to-bottom scroll layout in favor of a modern **Split View** architecture.
This layout divides the screen into two distinct functional areas, perfectly balancing the *collector/gamer* emotional appeal with the *investor* analytical needs.

### Layout Split
- **Left Column (40% width, Sticky/Fixed): The Showcase**
  - Dedicated entirely to the visual appreciation of the card.
  - Sticky on scroll, so the card art remains visible while browsing financial data.
- **Right Column (60% width, Scrollable): The Data Hub**
  - Contains all the analytical, financial, and metadata components.
  - Flows like a dense, rich dashboard.

---

## 2. Left Column: Component Details

**The 3D Holo Card**
- We will reuse and expand the `<HoloCard />` component (currently used in Dashboard) to provide a premium 3D tilt and holographic foil effect based on mouse movement.
- Size: taking up a huge portion of the left pane (e.g., `aspect-[5/7] max-w-sm`).

**Action Buttons**
- Floating directly beneath the card.
- **Add to Portfolio** (Primary bold styling)
- **Add to Wishlist** (Secondary styling)

**Background Context**
- The left column itself will have a very subtle, dark blurred version of the card's art as its background (`backdrop-blur`). This creates deep visual immersion without distracting from the card itself.

---

## 3. Right Column: Component Details

**A. Header Section**
- **Badges:** Set name, Rarity (color-coded), Card Code.
- **Title:** Large, bold typography for the Card Name.

**B. Performance Pulse (Pricing)**
- A prominent glassmorphic widget displaying the **Market Price**.
- Trend badges showing 7D and 30D changes (reusing logic from dashboard or simple placeholders if historical data is lacking per card, though we can reuse `PriceChart` data).

**C. Financial Tooling: "Buy / Compare"**
- A grid of 3 external marketplace buttons (TCGPlayer, Cardmarket, eBay Sold Listings) to immediately check real-world liquidity and alternative pricing.
*Uses the `marketplace.ts` helpers created previously.*

**D. Card Attributes Grid**
- A 4-column grid showing gameplay properties: Color, Type, Power, Attribute.
- Each tile uses a subtle icon and muted text.

**E. Price History Chart**
- Reusing the newly built `PriceChart` component (the one with the `7D/1M/3M/6M/MAX` range selector) for this specific card's history.
- This creates total UI consistency between the Dashboard's portfolio history and the individual Card history.

---

## 4. Mobile Responsiveness
On mobile screens (`< 1024px`), the Split View will gracefully collapse into a standard vertical stack:
1. Holo Card + Actions (top, full width)
2. Header + Price + Data Hub + Chart (bottom, scrollable)

## 5. Security & Constraints
- No changes required to backend fetching. Data is already fully available in the `CardDetailClient`.
- Next.js dynamic routing remains unchanged.
