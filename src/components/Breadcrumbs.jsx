'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCookie } from '@/utils/cookies';
import { useEffect, useMemo, useState } from 'react';

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

export default function Breadcrumbs({ variant = 'default' }) {
  const pathname = usePathname() || '/';
  const isHome = pathname === '/';

  // Hooks must be called unconditionally (same order each render)
  const [lastTab, setLastTab] = useState('');

  useEffect(() => {
    setLastTab(decodeURIComponent(getCookie('activeMenu') || ''));
  }, [pathname]);

  const crumbs = useMemo(() => {
    const segments = pathname.split('/');
    return segments
      .map((seg, idx) => {
        const href = '/' + segments.slice(1, idx + 1).join('/');
        const isLast = idx === segments.length - 1;
        return { href: idx === 0 ? '/' : href, label: labelFor(seg), isLast };
      })
      .filter(c => !(c.href !== '/' && c.label === ''));
  }, [pathname]);

  // Decide to render nothing for home AFTER hooks are declared
  if (isHome) return null;

  const containerStyle =
    variant === 'drawer'
      ? { margin: '0 0 12px 0', fontSize: '0.9rem' }
      : { margin: '12px 0' };

  return (
    <nav aria-label="Breadcrumb" style={containerStyle}>
      <ol style={{display:'flex', gap:'8px', listStyle:'none', padding:0, margin:0}}>
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
