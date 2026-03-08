'use client';
import { useState, useRef } from 'react';

type Props = {
  onResults: (data: any) => void;
  onError: (msg: string) => void;
  setLoading: (v: boolean) => void;
};

// Popular airports list
const AIRPORTS = [
  { code: 'LHR', name: 'London Heathrow', city: 'London' },
  { code: 'JFK', name: 'New York JFK', city: 'New York' },
  { code: 'LAX', name: 'Los Angeles', city: 'Los Angeles' },
  // Major world airports (50+ hubs)
const AIRPORTS = [
  // UK & Ireland
  { code: 'LHR', name: 'London Heathrow', city: 'London' },
  { code: 'LGW', name: 'London Gatwick', city: 'London' },
  { code: 'MAN', name: 'Manchester', city: 'Manchester' },
  { code: 'EDI', name: 'Edinburgh', city: 'Edinburgh' },
  { code: 'DUB', name: 'Dublin', city: 'Dublin' },
  { code: 'BHX', name: 'Birmingham', city: 'Birmingham' },
  
  // USA
  { code: 'JFK', name: 'New York JFK', city: 'New York' },
  { code: 'EWR', name: 'Newark', city: 'New York' },
  { code: 'LAX', name: 'Los Angeles', city: 'Los Angeles' },
  { code: 'ORD', name: 'Chicago O\'Hare', city: 'Chicago' },
  { code: 'ATL', name: 'Atlanta', city: 'Atlanta' },
  { code: 'DFW', name: 'Dallas/Fort Worth', city: 'Dallas' },
  { code: 'SFO', name: 'San Francisco', city: 'San Francisco' },
  { code: 'SEA', name: 'Seattle', city: 'Seattle' },
  { code: 'MIA', name: 'Miami', city: 'Miami' },
  { code: 'BOS', name: 'Boston', city: 'Boston' },
  { code: 'IAD', name: 'Washington Dulles', city: 'Washington DC' },
  { code: 'LAS', name: 'Las Vegas', city: 'Las Vegas' },
  { code: 'MCO', name: 'Orlando', city: 'Orlando' },
  
  // Europe
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam' },
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt' },
  { code: 'MAD', name: 'Madrid', city: 'Madrid' },
  { code: 'BCN', name: 'Barcelona', city: 'Barcelona' },
  { code: 'FCO', name: 'Rome Fiumicino', city: 'Rome' },
  { code: 'MUC', name: 'Munich', city: 'Munich' },
  { code: 'ZRH', name: 'Zurich', city: 'Zurich' },
  { code: 'VIE', name: 'Vienna', city: 'Vienna' },
  { code: 'LIS', name: 'Lisbon', city: 'Lisbon' },
  { code: 'CPH', name: 'Copenhagen', city: 'Copenhagen' },
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm' },
  { code: 'OSL', name: 'Oslo', city: 'Oslo' },
  { code: 'BRU', name: 'Brussels', city: 'Brussels' },
  
  // Middle East
  { code: 'DXB', name: 'Dubai', city: 'Dubai' },
  { code: 'DOH', name: 'Doha', city: 'Doha' },
  { code: 'AUH', name: 'Abu Dhabi', city: 'Abu Dhabi' },
  { code: 'IST', name: 'Istanbul', city: 'Istanbul' },
  
  // Asia-Pacific
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore' },
  { code: 'HKG', name: 'Hong Kong', city: 'Hong Kong' },
  { code: 'NRT', name: 'Tokyo Narita', city: 'Tokyo' },
  { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo' },
  { code: 'ICN', name: 'Seoul Incheon', city: 'Seoul' },
  { code: 'PEK', name: 'Beijing Capital', city: 'Beijing' },
  { code: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai' },
  { code: 'CAN', name: 'Guangzhou', city: 'Guangzhou' },
  { code: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok' },
  { code: 'KUL', name: 'Kuala Lumpur', city: 'Kuala Lumpur' },
  { code: 'DEL', name: 'Delhi', city: 'Delhi' },
  { code: 'BOM', name: 'Mumbai', city: 'Mumbai' },
  { code: 'SYD', name: 'Sydney', city: 'Sydney' },
  { code: 'MEL', name: 'Melbourne', city: 'Melbourne' },
  
  // Canada
  { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto' },
  { code: 'YVR', name: 'Vancouver', city: 'Vancouver' },
  
  // Latin America
  { code: 'MEX', name: 'Mexico City', city: 'Mexico City' },
  { code: 'GRU', name: 'São Paulo', city: 'São Paulo' },
  
  // Africa
  { code: 'JNB', name: 'Johannesburg', city: 'Johannesburg' },
  { code: 'CAI', name: 'Cairo', city: 'Cairo' },
];
  const [to, setTo] = useState('JFK');
  const [depDate, setDepDate] = useState('');
  const [retDate, setRetDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [cabin, setCabin] = useState('economy');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  
  const depDateRef = useRef<HTMLInputElement>(null);
  const retDateRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
  const dateWrapper = 'relative cursor-pointer';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trip type toggle */}
      <div className="flex gap-2">
        {(['one-way', 'return'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTripType(t)}
            className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
              tripType === t ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}>
            {t === 'one-way' ? 'One-way' : 'Return'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* From Airport */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-400 mb-1">From</label>
          <select
            required
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={`${input} w-full uppercase font-mono`}>
            <option value="" disabled>Select airport</option>
            {AIRPORTS.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.code} - {airport.city}
              </option>
            ))}
          </select>
        </div>

        {/* To Airport */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-400 mb-1">To</label>
          <select
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={`${input} w-full uppercase font-mono`}>
            <option value="" disabled>Select airport</option>
            {AIRPORTS.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.code} - {airport.city}
              </option>
            ))}
          </select>
        </div>

        {/* Departure Date */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Departure</label>
          <div
            className={dateWrapper}
            onClick={() => depDateRef.current?.showPicker?.()}>
            <input
              id="depDate"
              ref={depDateRef}
              required
              type="date"
              value={depDate}
              onChange={(e) => setDepDate(e.target.value)}
              className={`${input} w-full cursor-pointer`}
            />
          </div>
        </div>

        {/* Return Date (conditional) */}
        {tripType === 'return' && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Return</label>
            <div
              className={dateWrapper}
              onClick={() => retDateRef.current?.showPicker?.()}>
              <input
                id="retDate"
                ref={retDateRef}
                type="date"
                value={retDate}
                onChange={(e) => setRetDate(e.target.value)}
                className={`${input} w-full cursor-pointer`}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Adults */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Adults</label>
          <select
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className={`${input} w-full`}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} Adult{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Cabin */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Cabin</label>
          <select
            value={cabin}
            onChange={(e) => setCabin(e.target.value)}
            className={`${input} w-full`}>
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50 transition-colors">
        Search Flights
      </button>
    </form>
  );
}
