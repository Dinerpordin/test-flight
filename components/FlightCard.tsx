'use client';
import { useState } from 'react';

type Segment = {
  departing_at: string;
  arriving_at: string;
  origin: { iata_code: string; city_name: string };
  destination: { iata_code: string; city_name: string };
  operating_carrier: { name: string; iata_code: string };
  operating_carrier_flight_number: string;
  passengers?: {
    passenger_id: string;
    cabin_class?: string;
    fare_basis_code?: string;
    baggages?: { type: string; quantity: number }[];
  }[];
};
type OfferSlice = {
  segments: Segment[];
  duration: string;
  origin: { iata_code: string };
  destination: { iata_code: string };
};
type BaggageAllowance = {
  quantity: number;
  max_weight_kg?: number | null;
  max_overall_weight_kg?: number | null;
  size_restrictions?: unknown;
} | null;
type BaggageInfo = {
  passengerId: string;
  passengerType: string;
  cabin_bags: BaggageAllowance;
  checked_bags: BaggageAllowance;
  baggages: { type: string; quantity: number }[];
};
type Conditions = {
  refundBeforeDeparture?: { allowed: boolean; penalty_amount?: string; penalty_currency?: string } | null;
  changeBeforeDeparture?: { allowed: boolean; penalty_amount?: string; penalty_currency?: string } | null;
};
type Offer = {
  id: string;
  baseAmount: string;
  taxAmount: string;
  markupAmount: string;
  totalAmount: string;
  totalCurrency: string;
  slices: OfferSlice[];
  passengers?: unknown[];
  owner: { name: string; iata_code: string };
  expiresAt: string;
  baggageInfo?: BaggageInfo[];
  conditions?: Conditions;
  cabinClass?: string;
  fareDetailsBySegment?: { origin: string; destination: string; cabin: string; fareBasis: string }[];
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
function BaggageSection({ baggageInfo }: { baggageInfo?: BaggageInfo[] }) {
  if (!baggageInfo || baggageInfo.length === 0) return null;
  const pax = baggageInfo[0];
  const segBaggages = pax?.baggages ?? [];
  // Count by type from segment-level data
  const cabin = segBaggages.filter(b => b.type === 'carry_on').reduce((s, b) => s + b.quantity, 0);
  const checked = segBaggages.filter(b => b.type === 'checked').reduce((s, b) => s + b.quantity, 0);
  // Fallback to offer-level allowances
  const cabinQty = cabin || pax?.cabin_bags?.quantity || 0;
  const checkedQty = checked || pax?.checked_bags?.quantity || 0;
  const checkedWeight = pax?.checked_bags?.max_weight_kg || pax?.checked_bags?.max_overall_weight_kg;
  return (
    <div className="flex flex-wrap gap-3 pt-1 border-t border-slate-700/60">
      <div className="flex items-center gap-1.5">
        <span className="text-base">🎒</span>
        <span className="text-xs text-slate-300">
          {cabinQty > 0 ? `${cabinQty}x cabin bag` : 'No cabin bag'}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-base">🧳</span>
        <span className={`text-xs ${checkedQty > 0 ? 'text-slate-300' : 'text-red-400'}`}>
          {checkedQty > 0
            ? `${checkedQty}x checked${checkedWeight ? ` (max ${checkedWeight}kg)` : ''}`
            : 'No checked bag included'}
        </span>
      </div>
    </div>
  );
}
function ConditionsSection({ conditions }: { conditions?: Conditions }) {
  if (!conditions) return null;
  const refund = conditions.refundBeforeDeparture;
  const change = conditions.changeBeforeDeparture;
  if (refund === null && change === null) return null;
  return (
    <div className="flex flex-wrap gap-3 pt-1">
      {refund !== null && refund !== undefined && (
        <div className="flex items-center gap-1">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            refund.allowed ? 'bg-green-900/40 text-green-400' : 'bg-red-900/30 text-red-400'
          }`}>
            {refund.allowed
              ? refund.penalty_amount && refund.penalty_amount !== '0.00'
                ? `Refund: -${refund.penalty_currency} ${refund.penalty_amount}`
                : 'Free refund'
              : 'Non-refundable'}
          </span>
        </div>
      )}
      {change !== null && change !== undefined && (
        <div className="flex items-center gap-1">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            change.allowed ? 'bg-blue-900/40 text-blue-400' : 'bg-slate-700 text-slate-400'
          }`}>
            {change.allowed
              ? change.penalty_amount && change.penalty_amount !== '0.00'
                ? `Change: -${change.penalty_currency} ${change.penalty_amount}`
                : 'Free change'
              : 'No changes'}
          </span>
        </div>
      )}
    </div>
  );
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
  const [expanded, setExpanded] = useState(false);
  const isReturn = (offer.slices?.length ?? 0) > 1;
  const outbound = offer.slices?.[0];
  const inbound = offer.slices?.[1];
  const base = parseFloat(offer.baseAmount || '0');
  const tax = parseFloat(offer.taxAmount || '0');
  const markup = parseFloat(offer.markupAmount || '0');
  const total = parseFloat(offer.totalAmount || '0');
  const cur = offer.totalCurrency;
  const hasBreakdown = base > 0 || tax > 0;
  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 flex flex-col gap-3 hover:border-cyan-500/50 transition-colors">
      {/* Carrier name + cabin badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-slate-200">{offer.owner?.name ?? 'Unknown airline'}</span>
        {isReturn && (
          <span className="ml-1 text-xs bg-cyan-900/40 text-cyan-400 px-2 py-0.5 rounded-full">Return</span>
        )}
        {offer.cabinClass && (
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full capitalize">
            {offer.cabinClass.replace('_', ' ')}
          </span>
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
      {/* Baggage row */}
      <BaggageSection baggageInfo={offer.baggageInfo} />
      {/* Conditions row */}
      <ConditionsSection conditions={offer.conditions} />
      {/* Price + CTA */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <p className="text-xl font-bold text-white">
            {cur} {total.toFixed(2)}
          </p>
          {hasBreakdown ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-slate-400 hover:text-slate-300 underline underline-offset-2 mt-0.5"
            >
              {expanded ? 'Hide breakdown ▲' : 'Show breakdown ▼'}
            </button>
          ) : (
            <p className="text-xs text-slate-400">incl. taxes & fees</p>
          )}
          {expanded && hasBreakdown && (
            <div className="mt-2 text-xs text-slate-400 space-y-0.5 bg-slate-900/50 rounded-lg px-3 py-2">
              <div className="flex justify-between gap-6">
                <span>Base fare</span>
                <span className="text-slate-300">{cur} {base.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span>Taxes & carrier charges</span>
                <span className="text-slate-300">{cur} {tax.toFixed(2)}</span>
              </div>
              {markup > 0 && (
                <div className="flex justify-between gap-6">
                  <span>Service fee</span>
                  <span className="text-slate-300">{cur} {markup.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between gap-6 border-t border-slate-700 pt-1 font-semibold text-white">
                <span>Total</span>
                <span>{cur} {total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => onSelect?.(offer)}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-5 py-2 rounded-lg transition-colors shrink-0"
        >
          Select
        </button>
      </div>
    </div>
  );
}
