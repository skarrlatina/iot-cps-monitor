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
    <header className="sticky top-0 z-50 border-b border-steel/15 bg-fog/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-wide text-signal"
        >
          CPS Monitor
        </Link>

        <ul className="flex items-center gap-1 sm:gap-2">
          {links.map(({ href, label }) => {
            const active =
              href === '/'
                ? pathname === '/'
                : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    'block px-3 py-2 text-sm transition-colors',
                    active
                      ? 'font-medium text-ink border-b-2 border-signal'
                      : 'text-steel hover:text-ink',
                  ].join(' ')}
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
