'use client';

import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-sky-400">Sky</span>
          <span>Search</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <Link href="/trips" className="hover:text-slate-100 transition-colors">My Trips</Link>
          <Link href="/alerts" className="hover:text-slate-100 transition-colors">Alerts</Link>
          <button aria-label="User menu" className="h-8 w-8 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors flex items-center justify-center text-xs font-bold">
            U
          </button>
        </div>
      </nav>
    </header>
  );
}
