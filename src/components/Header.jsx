'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { setCookie } from '@/utils/cookies';
import Breadcrumbs from '@/components/Breadcrumbs';

const MENU = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/tabs', label: 'Tabs' },
  { href: '/escape-room', label: 'Escape Room' },
  { href: '/coding-races', label: 'Coding Races' },
  { href: '/court-room', label: 'Court Room' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const pathname = usePathname();
  const btnRef = useRef(null);
  const firstLinkRef = useRef(null);

  // Theme init
  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('theme')) || 'light';
    setTheme(saved);
    if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', next);
    if (typeof window !== 'undefined') localStorage.setItem('theme', next);
  };

  // Remember active menu for breadcrumbs (cookie)
  useEffect(() => {
    const active = (MENU.find(m => m.href === pathname) || MENU[0]).label;
    setCookie('activeMenu', active, 30);
  }, [pathname]);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // ESC closes drawer
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Focus first link when drawer opens; lock body scroll
  useEffect(() => {
    if (open) {
      firstLinkRef.current?.focus();
      if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
    } else {
      if (typeof document !== 'undefined') document.body.style.overflow = '';
    }
  }, [open]);

  return (
    <>
      <header className="header" role="banner">
        <div className="header-inner header-grid">
          {/* Left: hamburger + student number (top-left) */}
          <div className="header-left">
            <button
              ref={btnRef}
              className="burger"
              data-open={open ? 'true' : 'false'}
              aria-expanded={open}
              aria-controls="site-drawer"
              aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setOpen(v => !v)}
            >
              <span className="burger-line" />
              <span className="burger-line" />
              <span className="burger-line" />
            </button>
            <span className="student-id" aria-label="Student Number">21819446</span>
          </div>

          {/* Centre: title */}
          <div className="header-center">
            <Link href="/" className="site-title" aria-label="Site home">
              CSE3CWA Assignment 2
            </Link>
          </div>

          {/* Right: theme toggle */}
          <div className="header-right">
            <button
              className="nav-toggle"
              onClick={toggleTheme}
              aria-label={`Activate ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title="Toggle theme"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={`backdrop ${open ? 'show' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Slide-in drawer */}
      <aside
        id="site-drawer"
        className={`drawer ${open ? 'open' : ''}`}
        aria-label="Primary navigation"
      >
        {/* Breadcrumbs under the hamburger icon (hidden on /) */}
        <Breadcrumbs variant="drawer" />

        <nav>
          <ul className="drawer-list">
            {MENU.map((m, i) => {
              const isActive = pathname === m.href;
              return (
                <li key={m.href}>
                  <Link
                    ref={i === 0 ? firstLinkRef : null}
                    href={m.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {m.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
