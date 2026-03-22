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
      const tax = parseFloat(offer.tax_amount || '0');
      const baseWithoutTax = base - tax;
      const markupAmount = parseFloat((base * (markup / 100)).toFixed(2));
      const totalWithMarkup = (base + markupAmount).toFixed(2);
      // Extract baggage info from offer passengers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const baggageInfo = offer.passengers?.map((pax: any) => ({
        passengerId: pax.id,
        passengerType: pax.type,
        cabin_bags: pax.cabin_bag_allowance
          ? {
              quantity: pax.cabin_bag_allowance.quantity,
              max_weight_kg: pax.cabin_bag_allowance.max_weight_kg ?? null,
              size_restrictions: pax.cabin_bag_allowance.size_restrictions ?? null,
            }
          : null,
        checked_bags: pax.checked_bag_allowance
          ? {
              quantity: pax.checked_bag_allowance.quantity,
              max_weight_kg: pax.checked_bag_allowance.max_weight_kg ?? null,
              max_overall_weight_kg: pax.checked_bag_allowance.max_overall_weight_kg ?? null,
            }
          : null,
        // Also check segment-level baggages
        baggages: offer.slices?.flatMap((slice: any) =>
          slice.segments?.flatMap((seg: any) =>
            seg.passengers?.find((sp: any) => sp.passenger_id === pax.id)?.baggages ?? []
          ) ?? []
        ) ?? [],
      })) ?? [];
      // Conditions: refund/change penalties
      const conditions = offer.conditions ?? {};
      return {
        id: offer.id,
        // Pricing breakdown
        baseAmount: baseWithoutTax.toFixed(2),   // Duffel base fare (excl. tax)
        taxAmount: tax.toFixed(2),                // Taxes & carrier charges
        markupAmount: markupAmount.toFixed(2),    // Our service fee
        totalAmount: totalWithMarkup,             // Final price shown to customer
        totalCurrency: offer.total_currency,
        // Flight data
        slices: offer.slices,
        passengers: offer.passengers,
        owner: offer.owner,
        expiresAt: offer.expires_at,
        // Baggage
        baggageInfo,
        // Fare conditions
        conditions: {
          refundBeforeDeparture: conditions.refund_before_departure ?? null,
          changeBeforeDeparture: conditions.change_before_departure ?? null,
        },
        // Fare class info
        cabinClass: offer.slices?.[0]?.segments?.[0]?.passengers?.[0]?.cabin_class ?? cabinClass,
        fareDetailsBySegment: offer.slices?.flatMap((slice: any) =>
          slice.segments?.map((seg: any) => ({
            origin: seg.origin?.iata_code,
            destination: seg.destination?.iata_code,
            cabin: seg.passengers?.[0]?.cabin_class ?? null,
            fareBasis: seg.passengers?.[0]?.fare_basis_code ?? null,
          })) ?? []
        ) ?? [],
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
