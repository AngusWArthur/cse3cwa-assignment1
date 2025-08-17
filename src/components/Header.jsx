'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getCookie, setCookie } from '@/utils/cookies';

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

  // Persist/restore theme
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  // Save active menu to cookie for breadcrumb memory
  useEffect(() => {
    const active = MENU.find(m => m.href === pathname)?.label ?? 'Home';
    setCookie('activeMenu', active, 30);
  }, [pathname]);

  // Close menu on route change (desktop-friendly)
  useEffect(() => { setOpen(false); }, [pathname]);

  // Basic ESC key handling for the menu button
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="header" role="banner">
      <div className="header-inner">
        <div className="brand">
          <span className="student-id" aria-label="Student Number">21819446</span>
          <span aria-hidden="true">|</span>
          <Link href="/" aria-label="Site home">CWA Assignment</Link>
        </div>

        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <button
            ref={btnRef}
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="primary-navigation"
            aria-label="Toggle navigation menu"
            onClick={() => setOpen(v => !v)}
          >
            ☰ Menu
          </button>
          <button
            className="nav-toggle"
            onClick={toggleTheme}
            aria-label={`Activate ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </div>

      <nav id="primary-navigation" className={`nav ${open ? 'open' : ''}`} aria-label="Primary">
        <ul>
          {MENU.map(m => (
            <li key={m.href}>
              <Link href={m.href} aria-current={pathname === m.href ? 'page' : undefined}>
                {m.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}