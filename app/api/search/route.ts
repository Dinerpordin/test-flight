import { NextRequest, NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';
import { Redis } from '@upstash/redis';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

const redis = new Redis({
  url: process.env.REDIS_URL!,
});

const CACHE_TTL = 600; // 10 minutes

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

    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached as object, cached: true });
    }

    const offerRequest = await duffel.offerRequests.create({
      slices,
      passengers,
      cabin_class: cabinClass,
      return_offers: returnOffers,
    });

    const markup = parseFloat(process.env.MARKUP_PERCENTAGE || '0');

    const results = offerRequest.data.offers?.map((offer: any) => {
      const base = parseFloat(offer.total_amount);
      const totalWithMarkup = (base * (1 + markup / 100)).toFixed(2);
      return {
        id: offer.id,
        totalAmount: totalWithMarkup,
        baseAmount: offer.total_amount,
        totalCurrency: offer.total_currency,
        slices: offer.slices,
        passengers: offer.passengers,
        owner: offer.owner,
        conditions: offer.conditions,
        expiresAt: offer.expires_at,
      };
    });

    const response = {
      offerRequestId: offerRequest.data.id,
      offers: results,
      liveMode: offerRequest.data.live_mode,
      cached: false,
    };

    await redis.set(cacheKey, response, { ex: CACHE_TTL });
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[/api/search]', error);
    return NextResponse.json(
      { error: error.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
