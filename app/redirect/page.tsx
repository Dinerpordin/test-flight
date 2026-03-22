'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function RedirectContent() {
  const params = useSearchParams();
  const url = params.get('to');
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    if (!url) return;

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          window.location.href = url;
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [url]);

  if (!url) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-slate-400">No redirect URL supplied.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-900 px-4 text-center">
      {/* Spinner */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />

      <div className="space-y-2">
        <p className="text-xl font-semibold text-white animate-pulse">
          Redirecting to partner…
        </p>
        <p className="text-sm text-slate-400">
          You are being taken to Kiwi.com to complete your booking.
        </p>
        <p className="text-xs text-slate-500">
          Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}…
        </p>
      </div>

      <button
        onClick={() => (window.location.href = url)}
        className="mt-2 rounded-lg bg-cyan-500 px-6 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-cyan-400"
      >
        Continue now
      </button>

      <p className="text-xs text-slate-600">
        You&apos;ll complete your booking on our partner&apos;s site,
        where they handle payment and customer support.
      </p>
    </div>
  );
}

export default function RedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-900">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
        </div>
      }
    >
      <RedirectContent />
    </Suspense>
  );
}
