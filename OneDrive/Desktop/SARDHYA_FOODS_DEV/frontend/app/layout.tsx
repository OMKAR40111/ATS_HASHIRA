import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sardhya Foods',
  description: 'Online food shopping and catering booking platform'
};

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/cart', label: 'Cart' },
  { href: '/bookings', label: 'Bookings' },
  { href: '/admin', label: 'Admin' },
  { href: '/auth', label: 'Login' }
];

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <div className="page-shell app-header-inner">
            <Link className="brand" href="/">
              <span className="brand-mark">S</span>
              <span>
                Sardhya Foods
                <br />
                <small className="muted">Catering commerce studio</small>
              </span>
            </Link>
            <nav className="nav-links">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="page-shell">{children}</main>

        <footer className="app-footer">
          <div className="page-shell app-footer-inner">
            <span>Built for food shopping, event booking, and catering operations.</span>
            <span>Frontend: Next.js | Backend: Express | Database: MySQL-ready</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
