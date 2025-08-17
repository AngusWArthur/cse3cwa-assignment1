'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCookie } from '@/utils/cookies';
import { useEffect, useState } from 'react';

function labelFor(segment) {
  const map = {
    '': 'Home',
    'about': 'About',
    'tabs': 'Tabs',
    'escape-room': 'Escape Room',
    'coding-races': 'Coding Races',
    'court-room': 'Court Room',
  };
  return map[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname() || '/';
  const segments = pathname.split('/'); // e.g. ["", "about"]
  const [lastTab, setLastTab] = useState('');

  useEffect(() => {
    setLastTab(decodeURIComponent(getCookie('activeMenu') || ''));
  }, [pathname]);

  const crumbs = segments.map((seg, idx) => {
    const href = '/' + segments.slice(1, idx + 1).join('/');
    const isLast = idx === segments.length - 1;
    return { href: idx === 0 ? '/' : href, label: labelFor(seg), isLast };
  }).filter(c => !(c.href !== '/' && c.label === '')); // drop empty middles

  return (
    <nav aria-label="Breadcrumb" style={{margin: '12px 0'}}>
      <ol style={{display:'flex', gap: '8px', listStyle:'none', padding:0, margin:0}}>
        {crumbs.map((c, i) => (
          <li key={i}>
            {c.isLast ? (
              <span aria-current="page">{c.label}</span>
            ) : (
              <Link href={c.href}>{c.label}</Link>
            )}
            {!c.isLast && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
      {lastTab && (
        <p style={{margin:'6px 0 0', color:'var(--muted)'}}>
          Last selected menu: <strong>{lastTab}</strong> (from cookie)
        </p>
      )}
    </nav>
  );
}
