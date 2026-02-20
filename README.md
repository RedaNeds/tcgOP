# 🏴‍☠️ One Piece TCG Tracker

A **Finary-inspired** portfolio tracker for the One Piece Trading Card Game. Track your collection's value, monitor price trends, and analyze your asset allocation — all in a sleek, dark-mode fintech UI.

## ✨ Features

- **📊 Dashboard** — Real-time portfolio value, P&L tracking, price charts, and dynamic insights
- **🃏 Card Catalog** — Browse all cards with filters (set, color, rarity, type) and pagination
- **💼 Portfolio** — Manage your collection: add, edit, bulk delete, CSV export, and sort by any metric
- **📈 Performance** — Track your portfolio's performance over time with detailed analytics
- **🎯 Wishlist** — Watch cards and set target prices, convert to portfolio when ready
- **🧩 Allocation** — Visualize diversification by set, color, type, and rarity with interactive charts
- **⚙️ Settings** — Theme toggle (dark/light), multi-currency display (USD/EUR/JPY), profile management

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma |
| **Auth** | NextAuth.js (Credentials) |
| **Styling** | Vanilla CSS (custom dark theme) |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **State** | Zustand (local settings) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database ([Neon](https://neon.tech) free tier works great)

### Installation

```bash
# Clone the repository
git clone https://github.com/RedaNeds/tcgOP.git
cd tcgOP

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET
```

### Environment Variables

Create a `.env` file at the root:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXTAUTH_SECRET="your-secret-key"
```

### Database Setup

```bash
# Push the schema to your database
npx prisma db push

# Seed with card data
npm run seed
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — create an account and start tracking your collection!

## 📁 Project Structure

```
├── app/
│   ├── (auth)/          # Login & Register pages
│   ├── (dashboard)/     # All authenticated pages
│   │   ├── cards/       # Card catalog & detail
│   │   ├── portfolio/   # Portfolio management
│   │   ├── wishlist/    # Wishlist tracking
│   │   ├── allocation/  # Asset allocation charts
│   │   ├── performance/ # Performance analytics
│   │   └── settings/    # User settings
│   └── api/             # API routes (auth, cron)
├── components/          # Reusable UI components
├── lib/
│   ├── actions/         # Server Actions (data layer)
│   └── hooks/           # Custom React hooks
├── prisma/              # Schema & migrations
└── scripts/             # Seed & utility scripts
```

## 🗺️ Roadmap

- [x] Core portfolio tracking
- [x] Card catalog with filters & pagination
- [x] Wishlist with price targets
- [x] Asset allocation analytics
- [x] Multi-currency support
- [x] PostgreSQL migration (Vercel-ready)
- [ ] Progressive Web App (PWA)
- [ ] Price alert notifications
- [ ] Multi-language support (EN/FR)
- [ ] E2E test suite

## 📄 License

MIT

---

Built with ☕ and 🏴‍☠️ by [RedaNeds](https://github.com/RedaNeds)
