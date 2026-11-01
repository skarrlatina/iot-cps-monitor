import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Signature from '@/components/Signature';
import './globals.css';

export const metadata: Metadata = {
  title: 'CPS Monitor — IoT Temperature',
  description: 'Frontend for cyber-physical temperature sensor monitoring',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="min-h-screen antialiased">
        <div className="fx-stage" aria-hidden>
          <div className="fx-grid" />
          <div className="fx-beam" />
          <div className="fx-vignette" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-signal/15 bg-[#050910]/70 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-steel">
                CPS // neural thermal grid · live link
              </p>
              <Signature compact />
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
