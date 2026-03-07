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
          onResults={(data) => { setResults(data); setError(null); }}
          onError={setError}
          setLoading={setLoading}
        />
        {error && (
          <p className="mt-3 text-center text-sm text-red-400">{error}</p>
        )}
      </section>

      {/* Popular Routes */}
      {!results && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-500">
            Popular routes
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {POPULAR_ROUTES.map((r) => (
              <div
                key={r.label}
                className="flex-shrink-0 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 cursor-pointer hover:border-sky-500 transition-colors"
              >
                {r.label}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <span className="ml-3 text-slate-400">Searching live fares...</span>
        </div>
      )}
      {results && !loading && <ResultsList data={results} />}
    </div>
  );
}
