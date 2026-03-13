import { NextRequest, NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';
const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});
// Simple in-memory cache (resets on cold starts)
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 600_000; // 10 minutes in ms
function cacheGet(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}
function cacheSet(key: string, data: unknown): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slices,
      passengers,
      cabinClass = 'economy',
      returnOffers = true,
    } = body;
    if (!slices || !Array.isArray(slices) || slices.length === 0) {
      return NextResponse.json(
        { error: 'slices is required and must be a non-empty array' },
        { status: 400 }
      );
    }
    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return NextResponse.json(
        { error: 'passengers is required and must be a non-empty array' },
        { status: 400 }
      );
    }
    const cacheKey = `flight-search:${JSON.stringify({ slices, passengers, cabinClass })}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json({ ...(cached as object), cached: true });
    }
    const offerRequest = await duffel.offerRequests.create({
      slices,
      passengers,
      cabin_class: cabinClass,
      return_offers: returnOffers,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = offerRequest.data as any;
    const markup = parseFloat(process.env.MARKUP_PERCENTAGE || '0');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = data.offers?.map((offer: any) => {
      const base = parseFloat(offer.total_amount);
      const totalWithMarkup = (base * (1 + markup / 100)).toFixed(2);
      return {
        id: offer.id,
        totalAmount: totalWithMarkup,
        totalCurrency: offer.total_currency,
        slices: offer.slices,
        passengers: offer.passengers,
        owner: offer.owner,
        conditions: offer.conditions,
        expiresAt: offer.expires_at,
      };
    });
    const response = {
      offerRequestId: data.id,
      offers: results,
      liveMode: data.live_mode,
      cached: false,
    };
    cacheSet(cacheKey, response);
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[/api/search]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
