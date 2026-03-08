'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type BookingState = 'idle' | 'loading' | 'error';

export default function BookPage() {
  const { offerId } = useParams<{ offerId: string }>();
  const router = useRouter();
  const [state, setState] = useState<BookingState>('idle');
  const [error, setError] = useState('');

  // Passenger fields
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLInputElement>(null);
  const passportExpiryRef = useRef<HTMLInputElement>(null);
  const nationalityRef = useRef<HTMLInputElement>(null);

  const [offer, setOffer] = useState<any>(null);
  useEffect(() => {
    const raw = sessionStorage.getItem('selectedOffer');
    if (raw) setOffer(JSON.parse(raw));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setError('');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId,
          totalAmount: offer?.totalAmount,
          totalCurrency: offer?.totalCurrency,
          passenger: {
            given_name: firstNameRef.current?.value,
            family_name: lastNameRef.current?.value,
            born_on: dobRef.current?.value,
            gender: genderRef.current?.value,
            email: emailRef.current?.value,
            phone_number: phoneRef.current?.value,
            identity_documents: [{
              type: 'passport',
              unique_identifier: passportRef.current?.value,
              expires_on: passportExpiryRef.current?.value,
              issuing_country_code: nationalityRef.current?.value?.toUpperCase(),
            }],
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      // Redirect to confirmation page
      const params = new URLSearchParams();
      if (data.orderId) params.set('orderId', data.orderId);
      if (data.bookingReference) params.set('ref', data.bookingReference);
      router.push(`/confirmation?${params.toString()}`);
    } catch (err: any) {
      setError(err.message);
      setState('error');
    } finally {
      setState('idle');
    }
  }

  const input = 'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none';
  const label = 'block text-xs font-medium text-slate-400 mb-1';

  const outbound = offer?.slices?.[0];
  const inbound = offer?.slices?.[1];
  const isReturn = !!inbound;

  function legSummary(slice: any) {
    const seg0 = slice?.segments?.[0];
    const dep = seg0?.departing_at ? new Date(seg0.departing_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '';
    return `${slice?.origin?.iata_code} → ${slice?.destination?.iata_code} • ${dep}`;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-white mb-4">
            ← Back to results
          </button>
          <h1 className="text-2xl font-bold">Complete your booking</h1>
          <p className="text-slate-400 text-sm mt-1">Fill in passenger details to confirm your booking.</p>
        </div>

        {offer && (
          <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Flight summary</h2>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{offer.owner?.name}</span>
              {isReturn && <span className="text-xs bg-cyan-900/40 text-cyan-400 px-2 py-0.5 rounded-full">Return</span>}
            </div>
            <div className="text-sm text-slate-300 space-y-1">
              {outbound && <p>✈ Outbound: {legSummary(outbound)}</p>}
              {inbound && <p>✈ Return: {legSummary(inbound)}</p>}
            </div>
            <div className="pt-2 border-t border-slate-700 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-white">{offer.totalCurrency} {offer.totalAmount}</span>
              {offer.baseAmount !== offer.totalAmount && (
                <span className="text-sm text-slate-500 line-through">{offer.totalCurrency} {parseFloat(offer.baseAmount).toFixed(2)}</span>
              )}
              <span className="text-xs text-slate-400">incl. taxes & fees</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-lg font-semibold">Passenger details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>First name (as on passport)</label>
              <input ref={firstNameRef} required placeholder="e.g. John" className={input} />
            </div>
            <div>
              <label className={label}>Last name (as on passport)</label>
              <input ref={lastNameRef} required placeholder="e.g. Smith" className={input} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Date of birth</label>
              <input ref={dobRef} required type="date" className={input} />
            </div>
            <div>
              <label className={label}>Gender</label>
              <select ref={genderRef} required className={input}>
                <option value="">Select...</option>
                <option value="m">Male</option>
                <option value="f">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Email address</label>
              <input ref={emailRef} required type="email" placeholder="john@example.com" className={input} />
            </div>
            <div>
              <label className={label}>Phone number (with country code)</label>
              <input ref={phoneRef} required placeholder="+447700900000" className={input} />
            </div>
          </div>
          <h2 className="text-lg font-semibold pt-2">Travel document</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={label}>Passport number</label>
              <input ref={passportRef} required placeholder="123456789" className={input} />
            </div>
            <div>
              <label className={label}>Expiry date</label>
              <input ref={passportExpiryRef} required type="date" className={input} />
            </div>
            <div>
              <label className={label}>Nationality (ISO code)</label>
              <input ref={nationalityRef} required placeholder="GB" maxLength={2} className={`${input} uppercase`} />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/40 border border-red-500/40 p-3 text-sm text-red-300">{error}</div>
          )}

          <button
            type="submit"
            disabled={state === 'loading'}
            className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 text-base transition-colors"
          >
            {state === 'loading' ? 'Processing...' : `Confirm Booking — ${offer ? `${offer.totalCurrency} ${offer.totalAmount}` : ''} →`}
          </button>
          <p className="text-center text-xs text-slate-500">
            🔒 Payment is processed securely via Duffel. Your card details are never stored on this site.
          </p>
        </form>
      </div>
    </main>
  );
}
