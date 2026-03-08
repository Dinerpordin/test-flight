'use client';

import { useState } from 'react';
import { SearchForm } from '@/components/SearchForm';
import { ResultsList } from '@/components/ResultsList';

const POPULAR_ROUTES = [
  { from: 'LHR', to: 'JFK', label: 'London → New York' },
  { from: 'LHR', to: 'DXB', label: 'London → Dubai' },
  { from: 'LHR', to: 'CDG', label: 'London → Paris' },
  { from: 'MAN', to: 'BCN', label: 'Manchester → Barcelona' },
  { from: 'LGW', to: 'FCO', label: 'Gatwick → Rome' },
];

export default function HomePage() {
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);

  function handleSelect(offer: any) {
    setSelectedOffer(offer);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-8">
      {/* Hero Search Card */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-700/50 p-6 shadow-2xl backdrop-blur-sm">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Find your next flight
          </h1>
          <p className="text-slate-400">
            Real-time pricing on thousands of routes worldwide.
          </p>
        </div>
        <SearchForm
          onResults={(data) => { setResults(data); setError(null); setSelectedOffer(null); }}
          onError={setError}
          setLoading={setLoading}
        />
        {error && (
          <p className="mt-3 text-center text-sm text-red-400">{error}</p>
        )}
      </section>

      {/* Selected offer banner */}
      {selectedOffer && (
        <section className="rounded-2xl border border-cyan-500/40 bg-cyan-900/20 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-cyan-400 mb-1">Flight selected</p>
              <p className="text-lg font-bold text-white">
                {selectedOffer.owner?.name} &mdash; {selectedOffer.totalCurrency} {selectedOffer.totalAmount}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Offer ID: {selectedOffer.id}
              </p>
              {selectedOffer.expiresAt && (
                <p className="text-xs text-slate-400">
                  Price expires: {new Date(selectedOffer.expiresAt).toLocaleString('en-GB')}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedOffer(null)}
              className="text-xs text-slate-400 hover:text-white transition-colors shrink-0"
            >
              Dismiss
            </button>
          </div>
        </section>
      )}

      {/* Popular Routes */}
      {!results && (
        <section>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-500">Popular Routes</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_ROUTES.map((r) => (
              <button
                key={r.label}
                className="rounded-full border border-slate-700 px-4 py-1.5 text-sm text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
              >
                {r.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <ResultsList data={results} onSelect={handleSelect} />
      )}
    </div>
  );
}
