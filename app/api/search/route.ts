import { NextRequest, NextResponse } from 'next/server';

const KIWI_KEY = process.env.TEQUILA_API_KEY!;
const CACHE_TTL = 600_000; // 10 minutes in ms

const cache = new Map<string, { data: unknown; expires: number }>();

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

// Map Duffel cabin class names to Kiwi cabin codes
const CABIN_MAP: Record<string, string> = {
  economy: 'M',
  premium_economy: 'W',
  business: 'C',
  first: 'F',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot: reject bots that fill hidden field
    if (body.website) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    const {
      origin,
      destination,
      dateFrom,
      dateTo,
      adults = 1,
      cabinClass = 'economy',
    } = body;

    if (!origin || !destination || !dateFrom) {
      return NextResponse.json(
        { error: 'origin, destination and dateFrom are required' },
        { status: 400 }
      );
    }

    const kiwiCabin = CABIN_MAP[cabinClass] ?? 'M';

    const cacheKey = JSON.stringify({ origin, destination, dateFrom, dateTo, adults, cabinClass });
    const hit = cacheGet(cacheKey);
    if (hit) {
      return NextResponse.json({ ...(hit as object), cached: true });
    }

    const params = new URLSearchParams({
      fly_from: origin.toUpperCase(),
      fly_to: destination.toUpperCase(),
      date_from: dateFrom,
      date_to: dateFrom,
      curr: 'GBP',
      sort: 'price',
      limit: '20',
      adults: String(adults),
      selected_cabins: kiwiCabin,
      partner_market: 'gb',
      // Enables Virtual Interlining / Hacker Fares automatically
      // (Kiwi combines separate tickets by default)
    });

    if (dateTo) {
      params.set('return_from', dateTo);
      params.set('return_to', dateTo);
    }

    const res = await fetch(
      `https://api.tequila.kiwi.com/v2/search?${params.toString()}`,
      {
        headers: { apikey: KIWI_KEY },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('[/api/search] Kiwi error', res.status, errText);
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const json = await res.json();

    // Normalise Kiwi response into a shape the UI understands
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flights = (json.data ?? []).map((f: any) => ({
      id: f.id,
      price: f.price,
      currency: json.currency ?? 'GBP',
      deep_link: f.deep_link,
      // Kiwi route array — each entry is one flight leg
      routes: f.route ?? [],
      duration: f.duration ?? {},
      flyFrom: f.flyFrom,
      flyTo: f.flyTo,
      cityFrom: f.cityFrom,
      cityTo: f.cityTo,
      dTime: f.dTime,
      aTime: f.aTime,
      dTimeUTC: f.dTimeUTC,
      aTimeUTC: f.aTimeUTC,
      nightsInDest: f.nightsInDest ?? null,
      // Airlines involved (may be multiple for virtual interlining)
      airlines: Array.from(
        new Set((f.route ?? []).map((r: any) => r.airline as string))
      ),
      // Hacker Fare flag — true when Kiwi combines separate tickets
      isVirtualInterline: (f.has_airport_change ?? false) || (f.route ?? []).some(
        (r: any, i: number, arr: any[]) =>
          i > 0 && r.airline !== arr[i - 1].airline
      ),
      baggageInfo: {
        cabin: f.bags_price ? Object.keys(f.bags_price).length > 0 : false,
        checked: f.baglimit ?? {},
      },
    }));

    const payload = { flights, total: json.data?.length ?? 0, currency: json.currency ?? 'GBP' };
    cacheSet(cacheKey, payload);

    return NextResponse.json({ ...payload, cached: false });
  } catch (error: unknown) {
    console.error('[/api/search]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
