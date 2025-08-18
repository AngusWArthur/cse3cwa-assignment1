'use client';

import { useState } from 'react';

export default function HomePage() {
  const [count, setCount] = useState(0);

  const card = {
    border: '1px solid var(--fg)',
    borderRadius: '10px',
    padding: '16px',
    background: 'var(--card)',
    color: 'var(--fg)',
  } as const;

  const button = {
    padding: '8px 12px',
    border: '1px solid var(--fg)',
    borderRadius: '8px',
    background: 'var(--bg)',
    color: 'var(--fg)',
    cursor: 'pointer',
  } as const;

  const pill = {
    padding: '3px 8px',
    border: '1px solid var(--fg)',
    borderRadius: '6px',
    background: 'var(--bg)',
    color: 'var(--fg)',
  } as const;

  const divider = {
    margin: '16px 0',
    border: 'none',
    borderTop: '1px solid var(--fg)',
    opacity: 0.4,
  } as const;

  const panel = {
    padding: '8px',
    background: 'var(--bg)',
    color: 'var(--fg)',
    borderRadius: '8px',
  } as const;

  return (
    <>
      <h1 style={{ margin: '0 0 12px 0' }}>Home</h1>

      <section aria-labelledby="intro-heading" style={card}>
        <h2 id="intro-heading" style={{ margin: '0 0 10px 0' }}>
          Inline HTML5 + JS + Inline CSS
        </h2>

        <p style={{ margin: '0 0 12px 0' }}>
          This section renders with inline styles only and interactive JavaScript via React.
        </p>

        <div role="group" aria-label="Counter demo" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setCount((c) => c + 1)}
            aria-label="Increment counter"
            style={button}
          >
            Click me
          </button>
          <span style={{ fontWeight: 600 }}>Count:</span>
          <output aria-live="polite" style={pill}>
            {count}
          </output>
        </div>

        <hr style={divider} />

        <article aria-labelledby="html-sample" style={panel}>
          <h3 id="html-sample" style={{ margin: '0 0 8px 0' }}>Sample Semantic Markup</h3>
          <p style={{ margin: '0 0 8px 0' }}>This demonstrates HTML5 semantics with inline styles.</p>
          <ul style={{ margin: '0 0 0 18px' }}>
            <li>Accessible header and theme toggle.</li>
            <li>Breadcrumbs with cookie memory.</li>
            <li>Footer with copyright, name, student number, date.</li>
          </ul>
        </article>
      </section>
    </>
  );
}
