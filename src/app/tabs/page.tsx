'use client';

import { useEffect, useMemo, useState } from 'react';
import { toCssOnlyInteractiveHtml, textToHtml } from '@/lib/tabsExport';

type Tab = { id: number; title: string; content: string };

const MAX_TABS = 15;
const STORAGE_KEY = 'tabs_builder_v4';
const LEGACY_KEYS = ['tabs_builder_v3', 'tabs_builder_v2'];

/* ---------- Type Guards ---------- */

function isTab(obj: unknown): obj is Tab {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.id === 'number' &&
    typeof o.title === 'string' &&
    typeof o.content === 'string'
  );
}

function isTabArray(arr: unknown): arr is Tab[] {
  return Array.isArray(arr) && arr.every(isTab);
}

/* ---------- SSR-safe bootstrap ---------- */

// Keep server & first client render identical.
const SSR_FALLBACK: Tab[] = [
  { id: 1, title: 'Overview', content: 'Welcome to the tabs demo.\nAdd more tabs and content.' },
];

/**
 * Reads current or legacy keys *on the client only*. Never call during SSR.
 */
function loadFromStorageOrLegacy(): Tab[] {
  // Just in case this is ever called too early.
  if (typeof window === 'undefined') return SSR_FALLBACK;

  // Current key
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr: unknown = JSON.parse(raw);
      if (isTabArray(arr)) {
        const trimmed = arr.slice(0, MAX_TABS);
        return trimmed.length ? trimmed : SSR_FALLBACK;
      }
    }
  } catch { /* ignore */ }

  // Legacy keys
  for (const k of LEGACY_KEYS) {
    try {
      const legacy = window.localStorage.getItem(k);
      if (!legacy) continue;
      const arr: unknown = JSON.parse(legacy);
      if (isTabArray(arr)) {
        const trimmed = arr.slice(0, MAX_TABS);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed)); // migrate
        return trimmed.length ? trimmed : SSR_FALLBACK;
      }
    } catch { /* ignore */ }
  }

  return SSR_FALLBACK;
}

/* ---------- Page Component ---------- */

export default function TabsPage() {
  // 1) Start with SSR-safe fallback; hydrate to the same HTML.
  const [tabs, setTabs] = useState<Tab[]>(SSR_FALLBACK);
  const [mounted, setMounted] = useState(false);

  // UI state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  // Save-to-DB UI state
  const [saveTitle, setSaveTitle] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // 2) After mount, load real tabs from storage (client-only).
  useEffect(() => {
    const loaded = loadFromStorageOrLegacy();
    setTabs(loaded);
    setMounted(true);
  }, []);

  // 3) Persist to localStorage when tabs change (client-only).
  useEffect(() => {
    if (!mounted) return; // avoid touching storage during SSR hydration
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs)); } catch {}
  }, [tabs, mounted]);

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

  // Exported HTML (CSS-only interactive). Only compute when mounted to avoid
  // any random/Date usage during the initial server render.
  const htmlOutput = useMemo(() => {
    if (!mounted) return '';
    const bare = tabs
      .slice(0, MAX_TABS)
      .map(({ title, content }) => ({ title, content }));
    // If your exporter uses Math.random() internally, hiding this block until
    // mount prevents hydration mismatches.
    return toCssOnlyInteractiveHtml(bare);
  }, [tabs, mounted]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  // ---- Save to DB (Prisma API) ----
  type TabDto = { id: number; title: string; content: string };
  type CreateResponse = {
    id: string;
    title: string;
    tabs: TabDto[];
    html: string;
    createdAt: string;
    updatedAt: string;
  };

  async function saveToDb(): Promise<void> {
    setSaving(true); setSaveMsg(null);
    try {
      const payload = {
        title: (saveTitle || 'Untitled').trim(),
        tabs: tabs.map<TabDto>(t => ({ id: t.id, title: t.title, content: t.content })),
        html: htmlOutput,
      };

      const res = await fetch('/api/tabsets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const maybeError = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(maybeError.error || `HTTP ${res.status}`);
      }

      const created: CreateResponse = await res.json();
      setSaveMsg(`Saved! Database record id=${created.id} created.`);
      setSaveTitle('');
    } catch (e) {
      setSaveMsg(`Save failed: ${String(e)}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3500);
    }
  }

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

      {/* Export: CSS-only interactive document + Copy + Save
          NOTE: Render this only once mounted to avoid hydration mismatches. */}
      {mounted && (
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

          {/* Save to DB */}
          <div style={{ marginTop: '16px', display: 'grid', gap: '8px', maxWidth: '560px' }}>
            <label>
              <span style={{ display: 'block', marginBottom: 4 }}>Save Title (for database)</span>
              <input
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="e.g., My first tabs export"
                style={input}
                aria-label="Save title for this tab set"
              />
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={saveToDb}
                disabled={saving || tabs.length === 0}
                aria-label="Save to database"
                style={{ ...btn, opacity: saving || tabs.length === 0 ? 0.6 : 1 }}
              >
                {saving ? 'Saving…' : 'Save to Database'}
              </button>
              {saveMsg && <span role="status" aria-live="polite">{saveMsg}</span>}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
