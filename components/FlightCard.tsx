type Segment = {
  departing_at: string;
  arriving_at: string;
  origin: { iata_code: string; city_name: string };
  destination: { iata_code: string; city_name: string };
  operating_carrier: { name: string; iata_code: string };
  operating_carrier_flight_number: string;
};

type OfferSlice = {
  segments: Segment[];
  duration: string;
  origin: { iata_code: string };
  destination: { iata_code: string };
};

type Offer = {
  id: string;
  totalAmount: string;
  baseAmount: string;
  totalCurrency: string;
  slices: OfferSlice[];
  owner: { name: string; iata_code: string };
  expiresAt: string;
};

function formatTime(iso: string) {
  if (!iso) return '--';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(iso: string) {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] ? `${match[1]}h ` : '';
  const m = match[2] ? `${match[2]}m` : '';
  return `${h}${m}`.trim();
}

export function FlightCard({ offer }: { offer: Offer }) {
  const firstSlice = offer.slices?.[0];
  const firstSeg = firstSlice?.segments?.[0];
  const lastSeg = firstSlice?.segments?.[firstSlice.segments.length - 1];
  const stops = (firstSlice?.segments?.length ?? 1) - 1;

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-sky-500/50 sm:flex-row sm:items-center sm:justify-between">
      {/* Carrier + route */}
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
          {offer.owner?.iata_code ?? '?'}
        </div>
        <div>
          <p className="text-sm font-medium">{offer.owner?.name ?? 'Unknown airline'}</p>
          <p className="text-xs text-slate-500">
            {firstSeg?.operating_carrier_flight_number ?? ''}
          </p>
        </div>
      </div>

      {/* Times + duration */}
      <div className="flex flex-1 items-center justify-between gap-4 text-center">
        <div>
          <p className="text-lg font-bold">{formatTime(firstSeg?.departing_at ?? '')}</p>
          <p className="text-xs text-slate-400">{firstSlice?.origin?.iata_code}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs text-slate-500">{formatDuration(firstSlice?.duration ?? '')}</p>
          <div className="flex items-center gap-1">
            <div className="h-px w-10 bg-slate-700" />
            <span className="text-xs text-slate-500">
              {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
            </span>
            <div className="h-px w-10 bg-slate-700" />
          </div>
        </div>
        <div>
          <p className="text-lg font-bold">{formatTime(lastSeg?.arriving_at ?? '')}</p>
          <p className="text-xs text-slate-400">{firstSlice?.destination?.iata_code}</p>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="flex flex-col items-end gap-2">
        <p className="text-xl font-bold">
          {offer.totalCurrency} {offer.totalAmount}
        </p>
        <p className="text-xs text-slate-500">incl. taxes &amp; fees</p>
        <button className="rounded-xl bg-sky-500 px-4 py-1.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors">
          Select
        </button>
      </div>
    </div>
  );
}
