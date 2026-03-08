'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmationContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('orderId');
  const bookingRef = params.get('ref');

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="text-6xl">✅</div>
        <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
        <p className="text-slate-400">Your flight has been booked successfully.</p>

        {(orderId || bookingRef) && (
          <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-6 text-left space-y-3">
            {bookingRef && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Booking Reference</p>
                <p className="text-2xl font-bold text-cyan-400 tracking-widest">{bookingRef}</p>
              </div>
            )}
            {orderId && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Order ID</p>
                <p className="text-sm text-slate-300 font-mono">{orderId}</p>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-slate-500">
          A confirmation email will be sent to the address you provided.
        </p>

        <button
          onClick={() => router.push('/')}
          className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 text-base transition-colors"
        >
          Search More Flights
        </button>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <ConfirmationContent />
    </Suspense>
  );
}
