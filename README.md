# test-flight

A production-ready **Next.js 15** flight search app powered by the **Duffel API** with Redis caching, automatic markup engine, and a dark-mode-first UI built with Tailwind CSS.

## Features

- Real-time flight search via [Duffel API](https://duffel.com)
- 10-minute Redis cache (Upstash) to reduce API costs
- Automatic markup engine (configurable %, default 6%)
- One-way and return trip search
- Cabin class + passenger count selection
- Cheapest / Fastest offer badges
- Dark-mode-first responsive UI
- App Router (Next.js 15)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 App Router |
| Styling | Tailwind CSS 3 |
| Flight API | Duffel (`@duffel/api`) |
| Cache | Upstash Redis (`@upstash/redis`) |
| Language | TypeScript |
| Deployment | Vercel (recommended) |

## Project Structure

```
test-flight/
  .env.example              # Environment variables template
  package.json
  next.config.mjs
  tsconfig.json
  tailwind.config.mjs
  postcss.config.mjs
  app/
    globals.css             # Dark theme + Tailwind
    layout.tsx              # Root layout with Navbar
    page.tsx                # Homepage with search + results
    api/
      search/
        route.ts            # POST /api/search (Duffel + Redis)
  components/
    Navbar.tsx
    SearchForm.tsx
    ResultsList.tsx
    FlightCard.tsx
```

## Quick Start

```bash
# 1. Clone
git clone https://github.com/Dinerpordin/test-flight.git
cd test-flight

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your tokens (see below)

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DUFFEL_ACCESS_TOKEN` | Yes | Duffel API token (`duffel_test_...` for dev) |
| `REDIS_URL` | Yes | Upstash or Redis Cloud URL |
| `MARKUP_PERCENTAGE` | No | Auto markup on prices (default: 6) |
| `DATABASE_URL` | No | PostgreSQL for saved searches/alerts |
| `NEXTAUTH_SECRET` | No | For auth (price alerts) |
| `RESEND_API_KEY` | No | Email confirmations |
| `STRIPE_SECRET_KEY` | No | Full payment flow |

Get a free Duffel test token at [app.duffel.com](https://app.duffel.com)
Get a free Redis instance at [upstash.com](https://upstash.com)

## API Reference

### `POST /api/search`

**Request body:**
```json
{
  "slices": [
    { "origin": "LHR", "destination": "JFK", "departure_date": "2026-06-01" }
  ],
  "passengers": [{ "type": "adult" }],
  "cabinClass": "economy"
}
```

**Response:**
```json
{
  "offerRequestId": "orq_...",
  "offers": [
    {
      "id": "off_...",
      "totalAmount": "523.40",
      "totalCurrency": "GBP",
      "slices": [...],
      "owner": { "name": "British Airways", "iata_code": "BA" }
    }
  ],
  "liveMode": false,
  "cached": false
}
```

## Cost Model

| Bookings/month | Markup revenue | Duffel cost | Net profit |
|----------------|---------------|-------------|------------|
| 10 | ~$270 | ~$75 | ~$195 |
| 50 | ~$1,560 | ~$410 | ~$1,150 |
| 200 | ~$5,760 | ~$1,560 | ~$4,200 |

Break-even: ~15-20 bookings/month at 6% markup.

## Deployment

```bash
# Deploy to Vercel
npx vercel --prod
```

Add all environment variables in the Vercel dashboard under **Settings > Environment Variables**.

Switch `DUFFEL_ACCESS_TOKEN` to `duffel_live_...` when going live.

## Roadmap

- [ ] Airport autocomplete (IATA code search)
- [ ] Prisma schema for saved searches + price alerts
- [ ] Price alert cron job (Resend emails)
- [ ] Booking flow (Duffel Orders API)
- [ ] Multi-city search
- [ ] Seat map preview
- [ ] Stripe payment integration

## License

MIT
