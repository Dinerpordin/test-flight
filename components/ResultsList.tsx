import { FlightCard } from './FlightCard';

type Props = {
  data: {
    offers?: any[];
    offerRequestId?: string;
    liveMode?: boolean;
    cached?: boolean;
  };
};

const SORT_OPTIONS = [
  { label: 'Price (low to high)', value: 'price-asc' },
  { label: 'Price (high to low)', value: 'price-desc' },
  { label: 'Duration', value: 'duration' },
] as const;

export function ResultsList({ data }: Props) {
  const offers = data.offers ?? [];

  if (offers.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        No flights found for this route. Try different dates or airports.
      </div>
    );
  }

  const sorted = [...offers].sort(
    (a, b) => parseFloat(a.totalAmount) - parseFloat(b.totalAmount)
  );

  const cheapest = sorted[0];
  const fastest = [...offers].sort((a, b) => {
    const da = a.slices?.[0]?.duration ?? '';
    const db = b.slices?.[0]?.duration ?? '';
    return da.localeCompare(db);
  })[0];

  return (
    <div className="space-y-3">
      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {offers.length} flights found
          {data.cached && (
            <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-500">
              cached
            </span>
          )}
        </p>
        <p className="text-xs text-slate-600">
          {data.liveMode ? 'Live prices' : 'Test mode'}
        </p>
      </div>

      {/* Best / Cheapest badges on first 2 results */}
      {sorted.map((offer, i) => (
        <div key={offer.id} className="relative">
          {offer.id === cheapest?.id && (
            <span className="absolute -top-2 left-4 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-slate-950">
              Cheapest
            </span>
          )}
          {offer.id === fastest?.id && offer.id !== cheapest?.id && (
            <span className="absolute -top-2 left-4 z-10 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-slate-950">
              Fastest
            </span>
          )}
          <FlightCard offer={offer} />
        </div>
      ))}
    </div>
  );
}
