'use client';

import { useEffect, useMemo, useState } from 'react';

type Tab = { id: number; title: string; content: string };

const MAX_TABS = 15;
const STORAGE_KEY = 'tabs_builder_v4';
const LEGACY_KEYS = ['tabs_builder_v3', 'tabs_builder_v2'];

/* ---------- Helpers ---------- */

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) =>
    m === '&' ? '&amp;' :
    m === '<' ? '&lt;' :
    m === '>' ? '&gt;' :
    m === '"' ? '&quot;' :
    '&#39;'
  );
}

/** Render plain text content to HTML with <br> for line breaks */
function textToHtml(s: string) {
  return escapeHtml(s).replace(/\r?\n/g, '<br>');
}

/** Load initial tabs from localStorage synchronously (with legacy key fallback) */
function loadInitialTabs(): Tab[] {
  const fallback: Tab[] = [
    { id: 1, title: 'Overview', content: 'Welcome to the tabs demo.\nAdd more tabs and content.' },
  ];
  if (typeof window === 'undefined') return fallback;

  // Try current key
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const arr: unknown = JSON.parse(raw);
      if (Array.isArray(arr) && arr.every(x => typeof (x as any)?.id === 'number')) {
        const trimmed = (arr as Tab[]).slice(0, MAX_TABS);
        return trimmed.length ? trimmed : fallback;
      }
    } catch { /* ignore */ }
  }

  // Try legacy keys
  for (const k of LEGACY_KEYS) {
    const legacy = window.localStorage.getItem(k);
    if (!legacy) continue;
    try {
      const arr: unknown = JSON.parse(legacy);
      if (Array.isArray(arr) && arr.every(x => typeof (x as any)?.id === 'number')) {
        const trimmed = (arr as Tab[]).slice(0, MAX_TABS);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed)); // migrate forward
        return trimmed.length ? trimmed : fallback;
      }
    } catch { /* ignore */ }
  }

  return fallback;
}

/**
 * Generate a standalone CSS-only interactive HTML document using radio+label technique.
 * No classes are used; selectors rely on element/attribute/ID only.
 *
 * Structure:
 *   <div id="{uid}">
 *     <input id="{uid}-tab-0" ... />
 *     <input id="{uid}-tab-1" ... />
 *     <div id="{uid}-list" role="tablist">
 *       <label for="{uid}-tab-0" role="tab" ...>...</label>
 *       ...
 *     </div>
 *     <section id="{uid}-panel-0" role="tabpanel" ...>...</section>
 *     ...
 *   </div>
 *
 * CSS uses:
 *   #{uid}-tab-i:checked ~ #{uid}-list label[for="#{uid}-tab-i"] { ... }     // style active label
 *   #{uid}-tab-i:focus   ~ #{uid}-list label[for="#{uid}-tab-i"] { ... }     // focus outline on label
 *   #{uid}-tab-i:checked ~ #{uid}-panel-i { display:block }                  // show matching panel
 */
function toCssOnlyInteractiveHtml(
  tabs: { title: string; content: string }[]
): string {
  const uid = 'tabs-' + Math.random().toString(36).slice(2);
  const listId = `${uid}-list`;

  const baseCss = `
#${uid} { margin:16px }
#${uid} [role="tablist"] { display:flex; gap:8px; flex-wrap:wrap }
#${uid} input[type="radio"] { position:absolute; opacity:0; width:1px; height:1px; } /* keep focusable */
#${uid} label[for] { padding:8px 12px; border:1px solid #0003; border-radius:8px; cursor:pointer }
#${uid} [role="tabpanel"] { display:none; margin-top:12px; padding:12px; border:1px solid #0002; border-radius:8px }
`.trim();

  const activeLabelRules = tabs
    .map((_, i) =>
      `#${uid}-tab-${i}:checked ~ #${listId} label[for="${uid}-tab-${i}"] { border-bottom:2px solid #0a66c2 }`
    )
    .join('\n');

  // Keyboard focus outline on the associated label when the hidden radio is focused
  const focusLabelRules = tabs
    .map((_, i) =>
      `#${uid}-tab-${i}:focus ~ #${listId} label[for="${uid}-tab-${i}"] { outline:2px solid #ffbf47; outline-offset:2px }`
    )
    .join('\n');

  const panelVisibilityRules = tabs
    .map((_, i) =>
      `#${uid}-tab-${i}:checked ~ #${uid}-panel-${i} { display:block }`
    )
    .join('\n');

  const styleTag = `<style>
${baseCss}
${activeLabelRules}
${focusLabelRules}
${panelVisibilityRules}
</style>`;

  // radios first (siblings of list and panels)
  const radios = tabs
    .map((_, i) => {
      const checked = i === 0 ? ' checked' : '';
      return `  <input type="radio" name="${uid}-set" id="${uid}-tab-${i}"${checked} aria-controls="${uid}-panel-${i}" />`;
    })
    .join('\n');

  // labels inside the tablist
  const labels = tabs
    .map((t, i) => {
      const title = escapeHtml(t.title || `Tab ${i + 1}`);
      return `      <label for="${uid}-tab-${i}" role="tab" aria-controls="${uid}-panel-${i}">${title}</label>`;
    })
    .join('\n');

  // panels as siblings of radios and list
  const panels = tabs
    .map(
      (t, i) => `  <section id="${uid}-panel-${i}" role="tabpanel" aria-labelledby="${uid}-tab-${i}">
    ${textToHtml(t.content || '')}
  </section>`
    )
    .join('\n\n');

  const markup = [
    `<div id="${uid}" role="region" aria-label="Tabs">`,
    radios,
    `  <div role="tablist" aria-label="Tabs" id="${listId}">`,
    labels,
    `  </div>`,
    panels,
    `</div>`,
  ].join('\n');

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    '  <title>Tabs</title>',
    styleTag,
    '</head>',
    '<body>',
    markup,
    '</body>',
    '</html>',
  ].join('\n');
}

/* ---------- Page Component ---------- */

export default function TabsPage() {
  // Load immediately from localStorage (no initial flash)
  const [tabs, setTabs] = useState<Tab[]>(loadInitialTabs);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  // Save to localStorage on change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs)); } catch {}
  }, [tabs]);

  const canAdd = tabs.length < MAX_TABS;

  const addTab = () => {
    if (!canAdd) return;
    setTabs(t => [
      ...t,
      { id: Date.now(), title: title.trim() || `Tab ${t.length + 1}`, content }
    ]);
    setTitle('');
    setContent('');
    setActive(tabs.length); // focus new tab index
  };

  const updateTabTitle = (id: number, v: string) =>
    setTabs(t => t.map(x => x.id === id ? { ...x, title: v } : x));

  const updateTabContent = (id: number, v: string) =>
    setTabs(t => t.map(x => x.id === id ? { ...x, content: v } : x));

  const removeTab = (id: number) => {
    setTabs(t => {
      const idx = t.findIndex(x => x.id === id);
      const next = t.filter(x => x.id !== id);
      if (next.length === 0) {
        setActive(0);
        return [{ id: Date.now(), title: 'Tab 1', content: '' }];
      }
      if (idx >= 0) setActive(Math.max(0, Math.min(active, next.length - 1)));
      return next;
    });
  };

  // Exported HTML (CSS-only interactive)
  const htmlOutput = useMemo(
    () => toCssOnlyInteractiveHtml(tabs.slice(0, MAX_TABS).map(({ title, content }) => ({ title, content }))),
    [tabs]
  );

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  /* ---------- Inline styles (theme-aware via CSS variables) ---------- */
  const card = {
    border: '1px solid var(--fg)',
    borderRadius: '10px',
    padding: '16px',
    background: 'var(--card)',
    color: 'var(--fg)',
    marginBottom: '16px'
  } as const;

  const input = {
    width: '100%',
    padding: '8px',
    border: '1px solid var(--fg)',
    borderRadius: '8px',
    background: 'var(--bg)',
    color: 'var(--fg)'
  } as const;

  const mono = {
    ...input,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
  };

  const btn = {
    padding: '8px 12px',
    border: '1px solid var(--fg)',
    borderRadius: '8px',
    background: 'var(--bg)',
    color: 'var(--fg)',
    cursor: 'pointer'
  } as const;

  const list = {
    listStyle: 'none',
    padding: 0 as const,
    margin: 0 as const,
    display: 'grid',
    gap: '8px'
  } as const;

  const tabBtn = (selected: boolean) =>
    ({
      padding: '8px 12px',
      border: '1px solid var(--fg)',
      borderRadius: '8px',
      background: 'var(--bg)',
      color: 'var(--fg)',
      cursor: 'pointer',
      borderBottom: selected ? '2px solid var(--link)' : '1px solid var(--fg)'
    } as const);

  const panel = {
    marginTop: '12px',
    padding: '12px',
    border: '1px solid var(--fg)',
    borderRadius: '8px',
    background: 'var(--bg)',
    color: 'var(--fg)'
  } as const;

  return (
    <>
      <h1 style={{ margin: '0 0 12px 0' }}>Tabs</h1>

      {/* Builder */}
      <section aria-labelledby="builder" style={card}>
        <h2 id="builder" style={{ margin: '0 0 10px 0' }}>Configure Tabs (max {MAX_TABS})</h2>

        <div style={{ display: 'grid', gap: '10px', maxWidth: '820px' }}>
          <label>
            <span style={{ display: 'block', marginBottom: 4 }}>New Tab Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Details"
              aria-required="true"
              style={input}
            />
          </label>

          <label>
            <span style={{ display: 'block', marginBottom: 4 }}>New Tab Content (plain text; newlines preserved)</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              style={mono}
            />
          </label>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={addTab} disabled={!canAdd} aria-label="Add tab"
              style={{ ...btn, opacity: canAdd ? 1 : 0.5 }}>
              Add Tab
            </button>
          </div>
        </div>
      </section>

      {/* Edit existing */}
      <section aria-labelledby="current-tabs" style={card}>
        <h2 id="current-tabs" style={{ margin: '0 0 10px 0' }}>Edit Existing Tabs</h2>
        <ul style={list}>
          {tabs.map((t, idx) => (
            <li
              key={t.id}
              style={{
                display: 'grid',
                gap: '8px',
                border: '1px solid var(--fg)',
                borderRadius: '8px',
                padding: '10px',
                background: 'var(--bg)',
                color: 'var(--fg)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <strong>{idx + 1}.</strong>
                <input
                  value={t.title}
                  onChange={(e) => updateTabTitle(t.id, e.target.value)}
                  aria-label={`Title for tab ${idx + 1}`}
                  style={{ ...input, maxWidth: '420px' }}
                />
                <div>
                  <button onClick={() => setActive(idx)} style={btn} aria-label={`Preview tab ${idx + 1}`}>Preview</button>
                  <button onClick={() => removeTab(t.id)} style={{ ...btn, marginLeft: 8 }} aria-label={`Remove tab ${idx + 1}`}>Remove</button>
                </div>
              </div>
              <textarea
                value={t.content}
                onChange={(e) => updateTabContent(t.id, e.target.value)}
                rows={4}
                aria-label={`Content for tab ${idx + 1}`}
                style={mono}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Live preview (React state, inline styles only) */}
      <section aria-labelledby="rendered" style={card}>
        <h2 id="rendered" style={{ margin: '0 0 10px 0' }}>Rendered Preview</h2>

        <div role="tablist" aria-label="Tabs Preview" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tabs.map((t, i) => (
            <button
              key={t.id}
              id={`tab-${i}`}
              role="tab"
              aria-selected={i === active}
              aria-controls={`panel-${i}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              style={tabBtn(i === active)}
            >
              {t.title || `Tab ${i + 1}`}
            </button>
          ))}
        </div>

        {tabs.map((t, i) => (
          <section
            key={t.id}
            role="tabpanel"
            id={`panel-${i}`}
            aria-labelledby={`tab-${i}`}
            hidden={i !== active}
            style={panel}
            dangerouslySetInnerHTML={{ __html: textToHtml(t.content || '') }}
          />
        ))}
      </section>

      {/* Export: CSS-only interactive document + Copy */}
      <section aria-labelledby="code" style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <h2 id="code" style={{ margin: '0 0 10px 0' }}>Generated CSS-only Interactive HTML</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={copyAll} style={btn} aria-label="Copy exported HTML">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <p style={{ marginTop: 0 }}>
          Copy all of the code below into a blank file, save it as <code>Hello.html</code>, and open it in your browser.
        </p>
        <pre style={{ whiteSpace: 'pre-wrap', background: 'var(--bg)', padding: '12px', borderRadius: '8px', overflowX: 'auto' }}>
          <code>{htmlOutput}</code>
        </pre>
      </section>
    </>
  );
}