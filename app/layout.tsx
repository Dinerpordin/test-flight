import './globals.css';
import type { ReactNode } from 'react';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'SkySearch – Real-time Flight Search',
  description: 'Search, compare, and book flights powered by Duffel API',
  openGraph: {
    title: 'SkySearch',
    description: 'Real-time flight search with live pricing',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6">
          {children}
        </main>
        <footer className="mt-16 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} SkySearch. Powered by Duffel.
        </footer>
      </body>
    </html>
  );
}
