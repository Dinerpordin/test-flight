'use client';
import { useState, useRef } from 'react';
type Props = {
  onResults: (data: any) => void;
  onError: (msg: string) => void;
  setLoading: (v: boolean) => void;
};
export function SearchForm({ onResults, onError, setLoading }: Props) {
  const [tripType, setTripType] = useState<'one-way' | 'return'>('one-way');
  const [from, setFrom] = useState('LHR');
  const [to, setTo] = useState('JFK');
  const depRef = useRef<HTMLInputElement>(null);
  const retRef = useRef<HTMLInputElement>(null);
  const [adults, setAdults] = useState(1);
  const [cabin, setCabin] = useState('economy');
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const depDate = depRef.current?.value ?? '';
    const retDate = retRef.current?.value ?? '';
    setLoading(true);
    try {
      const slices = [
        { origin: from.toUpperCase(), destination: to.toUpperCase(), departure_date: depDate },
        ...(tripType === 'return' && retDate
          ? [{ origin: to.toUpperCase(), destination: from.toUpperCase(), departure_date: retDate }]
          : []),
      ];
      const passengers = Array.from({ length: adults }, () => ({ type: 'adult' }));
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slices, passengers, cabinClass: cabin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      onResults(data);
    } catch (err: any) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  }
  const input = 'rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none';
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        {(['one-way', 'return'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTripType(t)}
            className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
              tripType === t ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}>
            {t === 'one-way' ? 'One-way' : 'Return'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-400">From</label>
          <input required value={from} onChange={(e) => setFrom(e.target.value)} placeholder="LHR" maxLength={3} className={`${input} uppercase tracking-wider`} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-400">To</label>
          <input required value={to} onChange={(e) => setTo(e.target.value)} placeholder="JFK" maxLength={3} className={`${input} uppercase tracking-wider`} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-400">Departure</label>
          <input id="depDate" ref={depRef} required type="date" defaultValue="" className={input} />
        </div>
        {tripType === 'return' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400">Return</label>
            <input id="retDate" ref={retRef} type="date" defaultValue="" className={input} />
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-400">Adults</label>
          <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={input}>
            {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-400">Cabin</label>
          <select value={cabin} onChange={(e) => setCabin(e.target.value)} className={input}>
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
        </div>
        <button type="submit" className="ml-auto rounded-xl bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors">
          Search Flights
        </button>
      </div>
    </form>
  );
}
