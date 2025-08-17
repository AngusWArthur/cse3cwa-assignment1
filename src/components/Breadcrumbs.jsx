'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCookie } from '@/utils/cookies';
import { useEffect, useState } from 'react';

function labelFor(segment) {
  const map = {
    '': 'CSE3CWA Home',
    'about': 'About',
    'tabs': 'Tabs',
    'escape-room': 'Escape Room',
    'coding-races': 'Coding Races',
    'court-room': 'Court Room',
  };
  return map[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function Breadcrumbs({ variant = 'default' }) {
  const pathname = usePathname() || '/';

  // Hide breadcrumbs on the home page
  if (pathname === '/') return null;

  const segments = pathname.split('/');
  const [lastTab, setLastTab] = useState('');

  useEffect(() => {
    setLastTab(decodeURIComponent(getCookie('activeMenu') || ''));
  }, [pathname]);

  const crumbs = segments.map((seg, idx) => {
    const href = '/' + segments.slice(1, idx + 1).join('/');
    const isLast = idx === segments.length - 1;
    return { href: idx === 0 ? '/' : href, label: labelFor(seg), isLast };
  }).filter(c => !(c.href !== '/' && c.label === ''));

  const containerStyle =
    variant === 'drawer'
      ? { margin: '0 0 12px 0', fontSize: '0.9rem' }
      : { margin: '12px 0' };

  return (
    <nav aria-label="Breadcrumb" style={containerStyle}>
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
      {variant !== 'drawer' && lastTab && (
        <p style={{margin:'6px 0 0', color:'var(--muted)'}}>
        </p>
      )}
    </nav>
  );
}
