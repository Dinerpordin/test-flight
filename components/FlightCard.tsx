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
function SliceLeg({ slice, label }: { slice: OfferSlice; label?: string }) {
  const firstSeg = slice?.segments?.[0];
  const lastSeg = slice?.segments?.[slice.segments.length - 1];
  const stops = (slice?.segments?.length ?? 1) - 1;
  return (
    <div className="flex items-center gap-4 flex-1">
      {label && (
        <span className="text-xs text-slate-500 uppercase font-semibold w-14 shrink-0">{label}</span>
      )}
      <div className="text-center min-w-[56px]">
        <p className="text-lg font-bold">{formatTime(firstSeg?.departing_at ?? '')}</p>
        <p className="text-xs text-slate-400">{slice?.origin?.iata_code}</p>
      </div>
      <div className="flex-1 text-center">
        <p className="text-xs text-slate-400">{formatDuration(slice?.duration ?? '')}</p>
        <div className="border-t border-slate-600 my-1" />
        <p className="text-xs text-slate-500">
          {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
        </p>
      </div>
      <div className="text-center min-w-[56px]">
        <p className="text-lg font-bold">{formatTime(lastSeg?.arriving_at ?? '')}</p>
        <p className="text-xs text-slate-400">{slice?.destination?.iata_code}</p>
      </div>
    </div>
  );
}
export function FlightCard({
  offer,
  onSelect,
}: {
  offer: Offer;
  onSelect?: (offer: Offer) => void;
}) {
  const isReturn = (offer.slices?.length ?? 0) > 1;
  const outbound = offer.slices?.[0];
  const inbound = offer.slices?.[1];
  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 flex flex-col gap-3 hover:border-cyan-500/50 transition-colors">
      {/* Carrier name */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-200">{offer.owner?.name ?? 'Unknown airline'}</span>
        {isReturn && (
          <span className="ml-2 text-xs bg-cyan-900/40 text-cyan-400 px-2 py-0.5 rounded-full">Return</span>
        )}
      </div>
      {/* Outbound leg */}
      <SliceLeg slice={outbound} label={isReturn ? 'Out' : undefined} />
      {/* Return leg */}
      {isReturn && inbound && (
        <>
          <div className="border-t border-slate-700/60" />
          <SliceLeg slice={inbound} label="Back" />
        </>
      )}
      {/* Price + CTA */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xl font-bold text-white">
            {offer.totalCurrency} {offer.totalAmount}
          </p>
          <p className="text-xs text-slate-400">incl. taxes & fees</p>
        </div>
        <button
          onClick={() => onSelect?.(offer)}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          Select
        </button>
      </div>
    </div>
  );
}
