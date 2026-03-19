'use client';
import { useState, useRef, useMemo } from 'react';

type Props = {
  onResults: (data: any) => void;
  onError: (msg: string) => void;
  setLoading: (v: boolean) => void;
};

// Popular airports list
const AIRPORTS = [
  // UK & Ireland
  { code: 'LHR', name: 'London Heathrow', city: 'London' },
  { code: 'LGW', name: 'London Gatwick', city: 'London' },
  { code: 'MAN', name: 'Manchester', city: 'Manchester' },
  { code: 'EDI', name: 'Edinburgh', city: 'Edinburgh' },
  { code: 'DUB', name: 'Dublin', city: 'Dublin' },
  { code: 'BHX', name: 'Birmingham', city: 'Birmingham' },
  { code: 'GLA', name: 'Glasgow', city: 'Glasgow' },
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
  { code: 'PHX', name: 'Phoenix', city: 'Phoenix' },
  { code: 'IAH', name: 'Houston', city: 'Houston' },
  { code: 'DEN', name: 'Denver', city: 'Denver' },
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
  { code: 'ATH', name: 'Athens', city: 'Athens' },
  { code: 'PRG', name: 'Prague', city: 'Prague' },
  { code: 'WAW', name: 'Warsaw', city: 'Warsaw' },
  { code: 'BUD', name: 'Budapest', city: 'Budapest' },
  { code: 'OTP', name: 'Bucharest', city: 'Bucharest' },
  { code: 'MXP', name: 'Milan Malpensa', city: 'Milan' },
  { code: 'VCE', name: 'Venice', city: 'Venice' },
  // Middle East
  { code: 'DXB', name: 'Dubai', city: 'Dubai' },
  { code: 'DOH', name: 'Doha', city: 'Doha' },
  { code: 'AUH', name: 'Abu Dhabi', city: 'Abu Dhabi' },
  { code: 'IST', name: 'Istanbul', city: 'Istanbul' },
  { code: 'RUH', name: 'Riyadh', city: 'Riyadh' },
  { code: 'JED', name: 'Jeddah', city: 'Jeddah' },
  { code: 'KWI', name: 'Kuwait City', city: 'Kuwait' },
  { code: 'MCT', name: 'Muscat', city: 'Muscat' },
  { code: 'TLV', name: 'Tel Aviv', city: 'Tel Aviv' },
  { code: 'AMM', name: 'Amman', city: 'Amman' },
  { code: 'BEY', name: 'Beirut', city: 'Beirut' },
  { code: 'BAH', name: 'Bahrain', city: 'Manama' },
  // South Asia
  { code: 'DEL', name: 'Delhi', city: 'Delhi' },
  { code: 'BOM', name: 'Mumbai', city: 'Mumbai' },
  { code: 'BLR', name: 'Bangalore', city: 'Bangalore' },
  { code: 'HYD', name: 'Hyderabad', city: 'Hyderabad' },
  { code: 'MAA', name: 'Chennai', city: 'Chennai' },
  { code: 'CCU', name: 'Kolkata', city: 'Kolkata' },
  { code: 'DAC', name: 'Dhaka', city: 'Dhaka' },
  { code: 'KHI', name: 'Karachi', city: 'Karachi' },
  { code: 'LHE', name: 'Lahore', city: 'Lahore' },
  { code: 'ISB', name: 'Islamabad', city: 'Islamabad' },
  { code: 'CMB', name: 'Colombo', city: 'Colombo' },
  { code: 'KTM', name: 'Kathmandu', city: 'Kathmandu' },
  // Southeast Asia
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore' },
  { code: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok' },
  { code: 'KUL', name: 'Kuala Lumpur', city: 'Kuala Lumpur' },
  { code: 'CGK', name: 'Jakarta', city: 'Jakarta' },
  { code: 'MNL', name: 'Manila', city: 'Manila' },
  { code: 'SGN', name: 'Ho Chi Minh City', city: 'Ho Chi Minh' },
  { code: 'HAN', name: 'Hanoi', city: 'Hanoi' },
  { code: 'RGN', name: 'Yangon', city: 'Yangon' },
  // East Asia
  { code: 'HKG', name: 'Hong Kong', city: 'Hong Kong' },
  { code: 'NRT', name: 'Tokyo Narita', city: 'Tokyo' },
  { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo' },
  { code: 'ICN', name: 'Seoul Incheon', city: 'Seoul' },
  { code: 'KIX', name: 'Osaka Kansai', city: 'Osaka' },
  { code: 'TPE', name: 'Taipei', city: 'Taipei' },
  { code: 'PEK', name: 'Beijing Capital', city: 'Beijing' },
  { code: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai' },
  { code: 'CAN', name: 'Guangzhou', city: 'Guangzhou' },
  { code: 'SZX', name: 'Shenzhen', city: 'Shenzhen' },
  { code: 'CTU', name: 'Chengdu', city: 'Chengdu' },
  { code: 'XIY', name: 'Xi\'an', city: 'Xi\'an' },
  // Australia & Pacific
  { code: 'SYD', name: 'Sydney', city: 'Sydney' },
  { code: 'MEL', name: 'Melbourne', city: 'Melbourne' },
  { code: 'BNE', name: 'Brisbane', city: 'Brisbane' },
  { code: 'PER', name: 'Perth', city: 'Perth' },
  { code: 'AKL', name: 'Auckland', city: 'Auckland' },
  { code: 'CHC', name: 'Christchurch', city: 'Christchurch' },
  // Canada
  { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto' },
  { code: 'YVR', name: 'Vancouver', city: 'Vancouver' },
  { code: 'YUL', name: 'Montreal', city: 'Montreal' },
  { code: 'YYC', name: 'Calgary', city: 'Calgary' },
  // Latin America
  { code: 'MEX', name: 'Mexico City', city: 'Mexico City' },
  { code: 'GRU', name: 'São Paulo', city: 'São Paulo' },
  { code: 'GIG', name: 'Rio de Janeiro', city: 'Rio de Janeiro' },
  { code: 'BOG', name: 'Bogotá', city: 'Bogotá' },
  { code: 'LIM', name: 'Lima', city: 'Lima' },
  { code: 'SCL', name: 'Santiago', city: 'Santiago' },
  { code: 'EZE', name: 'Buenos Aires', city: 'Buenos Aires' },
  { code: 'PTY', name: 'Panama City', city: 'Panama City' },
  { code: 'CUN', name: 'Cancun', city: 'Cancun' },
  // Africa
  { code: 'JNB', name: 'Johannesburg', city: 'Johannesburg' },
  { code: 'CPT', name: 'Cape Town', city: 'Cape Town' },
  { code: 'CAI', name: 'Cairo', city: 'Cairo' },
  { code: 'LOS', name: 'Lagos', city: 'Lagos' },
  { code: 'NBO', name: 'Nairobi', city: 'Nairobi' },
  { code: 'ADD', name: 'Addis Ababa', city: 'Addis Ababa' },
  { code: 'CMN', name: 'Casablanca', city: 'Casablanca' },
  { code: 'ACC', name: 'Accra', city: 'Accra' },
  { code: 'ALG', name: 'Algiers', city: 'Algiers' },
  { code: 'TUN', name: 'Tunis', city: 'Tunis' },
];

export function SearchForm({ onResults, onError, setLoading }: Props) {
  const [tripType, setTripType] = useState<'one-way' | 'return'>('one-way');
  const [from, setFrom] = useState('LHR');
  const [fromSearch, setFromSearch] = useState('London');
  const [to, setTo] = useState('JFK');
  const [toSearch, setToSearch] = useState('New York');
  const [depDate, setDepDate] = useState('');
  const [retDate, setRetDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [cabin, setCabin] = useState('economy');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const depDateRef = useRef<HTMLInputElement>(null);
  const retDateRef = useRef<HTMLInputElement>(null);

  const filteredFromAirports = useMemo(() => {
    if (!fromSearch) return AIRPORTS;
    const s = fromSearch.toLowerCase();
    return AIRPORTS.filter(a => 
      a.city.toLowerCase().includes(s) || 
      a.name.toLowerCase().includes(s) || 
      a.code.toLowerCase().includes(s)
    );
  }, [fromSearch]);

  const filteredToAirports = useMemo(() => {
    if (!toSearch) return AIRPORTS;
    const s = toSearch.toLowerCase();
    return AIRPORTS.filter(a => 
      a.city.toLowerCase().includes(s) || 
      a.name.toLowerCase().includes(s) || 
      a.code.toLowerCase().includes(s)
    );
  }, [toSearch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const slices = [
        {
          origin: from.toUpperCase(),
          destination: to.toUpperCase(),
          departure_date: depDate
        },
        ...(tripType === 'return' && retDate ? [{
          origin: to.toUpperCase(),
          destination: from.toUpperCase(),
          departure_date: retDate
        }] : []),
      ];

      const passengers = Array.from({ length: adults }, () => ({ type: 'adult' }));

      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slices,
          passengers,
          cabinClass: cabin
        }),
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

  const inputClass = 'rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none';
  const dropdownItemClass = 'cursor-pointer px-3 py-2 text-sm hover:bg-slate-700 transition-colors';

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
              tripType === t
                ? 'bg-sky-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {t === 'one-way' ? 'One-way' : 'Return'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* From Airport */}
        <div className="relative space-y-2">
          <label className="text-sm font-medium text-slate-400">From</label>
          <input
            type="text"
            required
            value={fromSearch}
            onChange={(e) => {
              setFromSearch(e.target.value);
              setShowFromDropdown(true);
            }}
            onFocus={() => setShowFromDropdown(true)}
            onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
            placeholder="Type city or airport..."
            className={`${inputClass} w-full`}
          />
          {showFromDropdown && filteredFromAirports.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
              {filteredFromAirports.map((airport) => (
                <div
                  key={airport.code}
                  className={dropdownItemClass}
                  onClick={() => {
                    setFrom(airport.code);
                    setFromSearch(`${airport.code} - ${airport.city}`);
                    setShowFromDropdown(false);
                  }}
                >
                  <span className="font-bold text-sky-400">{airport.code}</span>
                  <span className="ml-2 text-slate-300">{airport.city}</span>
                  <span className="ml-2 text-xs text-slate-500">{airport.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* To Airport */}
        <div className="relative space-y-2">
          <label className="text-sm font-medium text-slate-400">To</label>
          <input
            type="text"
            required
            value={toSearch}
            onChange={(e) => {
              setToSearch(e.target.value);
              setShowToDropdown(true);
            }}
            onFocus={() => setShowToDropdown(true)}
            onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
            placeholder="Type city or airport..."
            className={`${inputClass} w-full`}
          />
          {showToDropdown && filteredToAirports.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
              {filteredToAirports.map((airport) => (
                <div
                  key={airport.code}
                  className={dropdownItemClass}
                  onClick={() => {
                    setTo(airport.code);
                    setToSearch(`${airport.code} - ${airport.city}`);
                    setShowToDropdown(false);
                  }}
                >
                  <span className="font-bold text-sky-400">{airport.code}</span>
                  <span className="ml-2 text-slate-300">{airport.city}</span>
                  <span className="ml-2 text-xs text-slate-500">{airport.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Departure Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Departure</label>
          <div className="relative cursor-pointer" onClick={() => depDateRef.current?.showPicker?.()}>
            <input
              id="depDate"
              ref={depDateRef}
              required
              type="date"
              value={depDate}
              onChange={(e) => setDepDate(e.target.value)}
              className={`${inputClass} w-full cursor-pointer`}
            />
          </div>
        </div>

        {/* Return Date (conditional) */}
        {tripType === 'return' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Return</label>
            <div className="relative cursor-pointer" onClick={() => retDateRef.current?.showPicker?.()}>
              <input
                id="retDate"
                ref={retDateRef}
                type="date"
                value={retDate}
                onChange={(e) => setRetDate(e.target.value)}
                className={`${inputClass} w-full cursor-pointer`}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Adults */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Adults</label>
          <select
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className={`${inputClass} w-full`}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} Adult{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Cabin */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Cabin</label>
          <select
            value={cabin}
            onChange={(e) => setCabin(e.target.value)}
            className={`${inputClass} w-full`}
          >
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-sky-500 py-3 font-semibold text-slate-950 transition-colors hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        Search Flights
      </button>
    </form>
  );
}
