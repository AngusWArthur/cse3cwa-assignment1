'use client';

import { useEffect, useMemo, useState } from 'react';

type Report = { id: string; label: string; src: string };

export default function ReportViewer({
  reports,
  defaultId,
  height = 900,
  title = 'Lighthouse Reports',
}: {
  reports: Report[];
  defaultId: string;
  height?: number;
  title?: string;
}) {
  // Allow ?report=<id> to preselect from URL (nice for sharing links)
  const urlSelected = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const p = new URLSearchParams(window.location.search);
    return p.get('report');
  }, []);

  const [selected, setSelected] = useState<string>(urlSelected ?? defaultId);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set('report', selected);
    const next = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', next);
  }, [selected]);

  const current = reports.find(r => r.id === selected) ?? reports[0];

  const frameStyle: React.CSSProperties = {
    width: '100%',
    height,
    border: '1px solid var(--fg)',
    borderRadius: 12,
    background: 'white',
  };

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--fg)',
    borderRadius: 12,
    padding: 16,
    background: 'var(--card)',
    color: 'var(--fg)',
  };

  const selectStyle: React.CSSProperties = {
    padding: '8px 10px',
    border: '1px solid var(--fg)',
    borderRadius: 8,
    background: 'var(--bg)',
    color: 'var(--fg)',
  };

  return (
    <section aria-labelledby="lh-reports" style={cardStyle}>
      <h2 id="lh-reports" style={{ marginTop: 0 }}>{title}</h2>

      <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
        <p>Below are the Lighthouse reports produced for my Tabs and Escape Room pages.</p>
        <span>Choose a report:</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={selectStyle}
          aria-label="Select Lighthouse report to view"
        >
          {reports.map(r => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </label>

      <div style={{ marginTop: 12 }}>
        <iframe
          src={current.src}
          title={`Lighthouse report: ${current.label}`}
          style={frameStyle}
        />
        <p style={{ marginTop: 8 }}>
          Can’t see the embed?{' '}
          <a href={current.src} target="_blank" rel="noopener noreferrer">
            Open this report in a new tab
          </a>.
        </p>
      </div>
    </section>
  );
}
