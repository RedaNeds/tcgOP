# Wishlist Modal Redesign: "Add to Wishlist"
**Date:** March 27, 2026
**Focus:** Enhancing Wishlist UX
**Target:** Add/Update Wishlist with customizable Target Price and Notes

## 1. Overview
The current "Add to Wishlist" button in `CardDetailClient.tsx` executes a quick server action that defaults the target price to 10% below the current market price.
This redesign will introduce a dedicated `AddWishlistModal.tsx` (similar to `AddCardModal.tsx`) to allow users to specify their exact target price and optional notes.

## 2. Components

### A. The Modal (`components/cards/AddWishlistModal.tsx`)
- **Backdrop & Animation**: Reuses the Framer Motion animation (`opacity`, `scale`) and the fixed backdrop from `AddCardModal`.
- **Top Section (Card Info)**:
  - Displays the Card Image, Rarity Badge, Code, Name, and Set.
- **Reference Section**:
  - A prominent "Current Market Price" readout so the user has immediate context for setting their target.
- **Form Inputs**:
  - `targetPrice` (Number Input, prepopulated with `card.currentPrice * 0.9` as a default starting point). We'll also add quick-set pills like [-10%] [-20%] [At Market] to rapidly populate the input.
  - `notes` (Textarea, optional), for reminders like "Wait for reprint".
- **Actions**:
  - `Save to Wishlist` (Primary CTA)
  - `Cancel` (Secondary CTA)

### B. Button Integration (`CardDetailClient.tsx`)
- The "ADD TO WISHLIST" button will no longer trigger the server action directly.
- It will set `showWishlistModal` to `true`.

### C. Backend Alignment
- `addToWishlist` inside `lib/actions/wishlist.ts` already accepts `cardId`, `targetPrice`, and `notes`. The backend is ready.

## 3. Workflow
1. User clicks "ADD TO WISHLIST".
2. `AddWishlistModal` opens.
3. User adjusts the target price (via explicit input or quick -10% buttons) and adds a note.
4. On save, `addToWishlist` is called.
5. Toast notification displays success, and the modal closes.
