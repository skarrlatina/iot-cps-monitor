'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/dashboard-temp', label: 'Temperature' },
  { href: '/login', label: 'Login' },
] as const;

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-signal/20 bg-[#050910]/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="sig-mark h-9 w-9 text-[10px]">CPS</span>
          <span className="leading-tight">
            <span className="block font-display text-sm tracking-[0.18em] text-ink">
              CPS MONITOR
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
              IoT telemetry
            </span>
          </span>
        </Link>

        <ul className="flex items-center">
          {links.map(({ href, label }) => {
            const active =
              href === '/' ? pathname === '/' : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={['nav-link', active ? 'nav-link-active' : ''].join(
                    ' ',
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
