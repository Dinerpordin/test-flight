'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchForm } from '@/components/SearchForm';
import { ResultsList } from '@/components/ResultsList';

export default function Home() {
  const router = useRouter();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleResults(data: any) {
    setResults(data);
    setError('');
  }

  function handleError(msg: string) {
    setError(msg);
    setResults(null);
  }

  function handleSelect(offer: any) {
    // Store the full offer in sessionStorage so the booking page can read it
    sessionStorage.setItem('selectedOffer', JSON.stringify(offer));
    router.push(`/book/${offer.id}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero / Search section */}
      <section className="px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Find your next flight</h1>
            <p className="mt-2 text-slate-400">Real-time pricing on thousands of routes worldwide.</p>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <SearchForm
              onResults={handleResults}
              onError={handleError}
              setLoading={setLoading}
            />
          </div>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <p className="text-center text-red-400 py-8">{error}</p>
      )}

      {/* Results */}
      {results && !loading && (
        <section className="px-4 pb-16">
          <div className="max-w-5xl mx-auto">
            <ResultsList offers={results.offers} onSelect={handleSelect} />
          </div>
        </section>
      )}

      {/* Popular routes */}
      {!results && !loading && (
        <section className="px-4 pb-16">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Popular routes</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'London → New York', from: 'LHR', to: 'JFK' },
                { label: 'London → Dubai', from: 'LHR', to: 'DXB' },
                { label: 'London → Paris', from: 'LHR', to: 'CDG' },
                { label: 'Manchester → Barcelona', from: 'MAN', to: 'BCN' },
                { label: 'Gatwick → Rome', from: 'LGW', to: 'FCO' },
              ].map((r) => (
                <button
                  key={r.label}
                  className="rounded-full border border-slate-700 px-4 py-1.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
