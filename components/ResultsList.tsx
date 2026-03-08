'use client';

import { useState } from 'react';
import { FlightCard } from './FlightCard';

type Props = {
  data: {
    offers?: any[];
    offerRequestId?: string;
    liveMode?: boolean;
    cached?: boolean;
  };
  onSelect?: (offer: any) => void;
};

const SORT_OPTIONS = [
  { label: 'Price (low to high)', value: 'price-asc' },
  { label: 'Price (high to low)', value: 'price-desc' },
  { label: 'Duration', value: 'duration' },
] as const;

export function ResultsList({ data, onSelect }: Props) {
  const [sort, setSort] = useState<'price-asc' | 'price-desc' | 'duration'>('price-asc');
  const offers = data.offers ?? [];

  if (offers.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        No flights found for this route. Try different dates or airports.
      </div>
    );
  }

  const sorted = [...offers].sort((a, b) => {
    if (sort === 'price-asc') return parseFloat(a.totalAmount) - parseFloat(b.totalAmount);
    if (sort === 'price-desc') return parseFloat(b.totalAmount) - parseFloat(a.totalAmount);
    // duration sort
    const da = a.slices?.[0]?.duration ?? '';
    const db = b.slices?.[0]?.duration ?? '';
    return da.localeCompare(db);
  });

  const cheapest = [...offers].sort((a, b) => parseFloat(a.totalAmount) - parseFloat(b.totalAmount))[0];
  const fastest = [...offers].sort((a, b) => {
    const da = a.slices?.[0]?.duration ?? '';
    const db = b.slices?.[0]?.duration ?? '';
    return da.localeCompare(db);
  })[0];

  return (
    <div className="space-y-3">
      {/* Results summary + sort */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {offers.length} flights found{' '}
          {data.cached && (
            <span className="ml-1 text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">cached</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="text-xs text-slate-500">
            {data.liveMode ? 'Live prices' : 'Test mode'}
          </span>
        </div>
      </div>

      {/* Flight cards */}
      {sorted.map((offer) => (
        <div key={offer.id} className="relative">
          {offer.id === cheapest?.id && (
            <span className="absolute -top-2 left-3 z-10 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Cheapest</span>
          )}
          {offer.id === fastest?.id && offer.id !== cheapest?.id && (
            <span className="absolute -top-2 left-3 z-10 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Fastest</span>
          )}
          <FlightCard offer={offer} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}
