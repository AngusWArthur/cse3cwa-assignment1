'use client';

import { useEffect, useMemo, useState } from 'react';

/** ---------------------- Types & Challenges ---------------------- */

type ChallengeId = 'laptop' | 'bookshelf' | 'safe';

type Challenge = {
  id: ChallengeId;
  title: string;
  timeLimitSec: number;
  prompt: string;
  starter: string;
  hint: string;
  validate: (value: unknown) => { ok: boolean; message: string };
};

const CHALLENGES: Challenge[] = [
  {
    id: 'laptop',
    title: 'Laptop: Count to 1000',
    timeLimitSec: 120,
    prompt:
      'Write a JavaScript function solve() that returns an array of integers from 1 to 1000 (inclusive). Example return: [1,2,3,...,1000]',
    starter: `function solve() {
  // Enter your code below
}`,
    hint:
      'Try creating an empty array, loop i from 1 to 1000, push i each time, then return the array.',
    validate: (v: unknown) => {
      if (!Array.isArray(v)) return { ok: false, message: 'Return value must be an array.' };
      if (v.length !== 1000) return { ok: false, message: `Array length is ${v.length}, expected 1000.` };
      for (let i = 0; i < 1000; i++) {
        if (v[i] !== i + 1) return { ok: false, message: `Value at index ${i} is ${String(v[i])}, expected ${i + 1}.` };
      }
      return { ok: true, message: 'Correct! The laptop powers on.' };
    },
  },
  {
    id: 'bookshelf',
    title: 'Bookshelf: Reverse a String',
    timeLimitSec: 90,
    prompt:
      'Write a JavaScript function solve() that takes the string "EscapeRoom" and returns its reverse "mooRepacsE".',
    starter: `function solve() {
  // Enter your code below

}`,
    hint:
      'Try using "EscapeRoom".split(\'\').reverse().join(\'\') to build the reversed string.',
    validate: (v: unknown) => {
      if (typeof v !== 'string') return { ok: false, message: 'Return value must be a string.' };
      return v === 'mooRepacsE'
        ? { ok: true, message: 'Correct! A hidden note falls out.' }
        : { ok: false, message: `Got "${v}", expected "mooRepacsE".` };
    },
  },
  {
    id: 'safe',
    title: 'Safe: Sum an Array',
    timeLimitSec: 120,
    prompt:
      'Write a JavaScript function solve() that returns the sum of this array: [5, 10, 20, 15]. Expected answer: 50',
    starter: `function solve() {
  // Enter your code below

}`,
    hint:
      'Try iterating through the array and adding each number to a running total, then return the total.',
    validate: (v: unknown) => {
      if (typeof v !== 'number') return { ok: false, message: 'Return value must be a number.' };
      return v === 50
        ? { ok: true, message: 'Correct! The safe clicks open.' }
        : { ok: false, message: `Got ${v}, expected 50.` };
    },
  },
];

/** ---------------------- Worker Runner ---------------------- */
/** Runs user code inside a Web Worker with a timeout. Expects user to define solve() and returns its value. */
function runUserCode(
  code: string,
  timeoutMs: number
): Promise<{ value?: unknown; error?: string; logs: string[] }> {
  return new Promise((resolve) => {
    const blob = new Blob(
      [
        `
      self.onmessage = (e) => {
        const { code } = e.data;
        const logs = [];
        const originalLog = console.log;
        try {
          console.log = (...args) => {
            logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
          };
          const userFn = new Function(code + '\\n;return (typeof solve === "function") ? solve() : undefined;');
          let value;
          try { value = userFn(); }
          catch (err) { console.log = originalLog; postMessage({ error: String(err), logs }); return; }
          console.log = originalLog;
          postMessage({ value, logs });
        } catch (err) {
          console.log = originalLog;
          postMessage({ error: String(err), logs });
        }
      };
    `,
      ],
      { type: 'application/javascript' }
    );

    const worker = new Worker(URL.createObjectURL(blob));
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try {
        worker.terminate();
      } catch {}
      resolve({ error: `Timed out after ${timeoutMs} ms`, logs: [] });
    }, timeoutMs);

    worker.onmessage = (e) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        worker.terminate();
      } catch {}
      resolve(e.data);
    };
    worker.onerror = (e) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        worker.terminate();
      } catch {}
      resolve({ error: String(e.message || 'Worker error'), logs: [] });
    };

    worker.postMessage({ code });
  });
}

/** ---------------------- Image + Hotspots ---------------------- */

const ROOM_IMAGE = '/escape/room.jpg';

type Hotspot = {
  id: ChallengeId;
  ariaLabel: string;
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
};

const HOTSPOTS: Hotspot[] = [
  { id: 'laptop', ariaLabel: 'Open challenge: Laptop', leftPct: 80, topPct: 38, widthPct: 20, heightPct: 30 },
  { id: 'bookshelf', ariaLabel: 'Open challenge: Bookshelf', leftPct: 10, topPct: 3, widthPct: 50, heightPct: 25 },
  { id: 'safe', ariaLabel: 'Open challenge: Safe', leftPct: 0, topPct: 80, widthPct: 15, heightPct: 20 },
];

/** ---------------------- Client Component ---------------------- */

export default function EscapeRoomClient() {
  const [openId, setOpenId] = useState<ChallengeId | null>(null);
  const [code, setCode] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [solved, setSolved] = useState<Record<ChallengeId, boolean>>({
    laptop: false,
    bookshelf: false,
    safe: false,
  });

  // Track whether each challenge has been opened at least once
  const [seen, setSeen] = useState<Record<ChallengeId, boolean>>({
    laptop: false,
    bookshelf: false,
    safe: false,
  });

  // Toggle for hotspot outlines (default off)
  const [showOutlines, setShowOutlines] = useState<boolean>(false);

  // Hint toggle in modal
  const [showHint, setShowHint] = useState<boolean>(false);

  const current = useMemo(() => CHALLENGES.find((c) => c.id === openId) || null, [openId]);

  // Timer
  useEffect(() => {
    if (!openId || !current) return;
    if (timeLeft <= 0 || !running) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [openId, current, timeLeft, running]);

  // Open/close
  const openChallenge = (id: ChallengeId) => {
    const ch = CHALLENGES.find((c) => c.id === id)!;
    setOpenId(id);
    setCode(ch.starter);
    setResult('');
    setLogs([]);
    setTimeLeft(ch.timeLimitSec);
    setRunning(true);
    setSeen((s) => ({ ...s, [id]: true })); // mark as seen
    setShowHint(false); // reset hint visibility when opening
  };
  const closeChallenge = () => {
    setOpenId(null);
    setRunning(false);
    setResult('');
    setLogs([]);
    setShowHint(false);
  };

  // Run/reset
  const run = async () => {
    if (!current) return;
    setResult('Running…');
    setLogs([]);
    const ms = Math.min(Math.max(current.timeLimitSec * 1000, 1000), 5 * 60 * 1000);
    const out = await runUserCode(code, ms);
    if (out.error) {
      setResult(`Error: ${out.error}`);
      setLogs(out.logs || []);
      return;
    }
    const check = current.validate(out.value);
    setResult(check.ok ? `✅ ${check.message}` : `❌ ${check.message}`);
    setLogs(out.logs || []);
    if (check.ok) {
      setSolved((s) => ({ ...s, [current.id]: true }));
      setRunning(false);
    }
  };
  const reset = () => {
    if (!current) return;
    setCode(current.starter);
    setResult('');
    setLogs([]);
    setTimeLeft(current.timeLimitSec);
    setRunning(true);
    setShowHint(false);
  };

  const allSolved = solved.laptop && solved.bookshelf && solved.safe;

  /** ---------------------- Inline styles (theme-aware) ---------------------- */
  const h1 = { margin: '0 0 12px 0' } as const;
  const card = {
    border: '1px solid var(--fg)',
    borderRadius: '10px',
    padding: '16px',
    background: 'var(--card)',
    color: 'var(--fg)',
    marginBottom: '16px',
  } as const;
  const btn = {
    padding: '8px 12px',
    border: '1px solid var(--fg)',
    borderRadius: '8px',
    background: 'var(--bg)',
    color: 'var(--fg)',
    cursor: 'pointer',
  } as const;
  const primary = { ...btn, borderColor: 'var(--link)' } as const;
  const input = {
    width: '100%',
    padding: '8px',
    border: '1px solid var(--fg)',
    borderRadius: '8px',
    background: 'var(--bg)',
    color: 'var(--fg)',
  } as const;
  const mono = {
    ...input,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  } as const;

  return (
    <>
      <h1 style={h1}>Escape Room</h1>

      {/* Scene using a real image */}
      <section aria-labelledby="scene" style={card}>
        <h2 id="scene" style={{ margin: '0 0 8px 0' }}>
          Explore the Room
        </h2>
        <p style={{ marginTop: 0 }}>You are trapped in an office. Try clicking on items in the image to unlock clues to escape.</p>

        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '980px',
            margin: '0 auto',
            border: '1px solid var(--fg)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <img
            src={ROOM_IMAGE}
            alt="Photo of an office with laptop, bookshelf, and safe. Click on hotspots in the image to open coding challenges."
            aria-describedby="room-desc"
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />

          {/* Visually hidden long description (for screen readers) */}
          <div
            id="room-desc"
            style={{ position: 'absolute', left: -99999, width: 1, height: 1, overflow: 'hidden' }}
          >
            The photo shows an image of an office desk. The desk has a computer on it and a row of books on a
            bookshelf above it. To the left of the desk on the floor is a small safe or filing cabinet. To the
            right of the desk is a laptop on a mechanical arm attached to the desk. The image has three
            interactive areas: the bookshelf, the safe and the laptop. Each area opens a coding challenge with
            a timer.
          </div>

          {HOTSPOTS.map((h) => (
            <button
              key={h.id}
              onClick={() => openChallenge(h.id)}
              aria-label={h.ariaLabel}
              style={{
                position: 'absolute',
                left: `${h.leftPct}%`,
                top: `${h.topPct}%`,
                width: `${h.widthPct}%`,
                height: `${h.heightPct}%`,
                background: 'transparent',
                border: showOutlines ? '2px solid var(--link)' : '2px solid transparent',
                cursor: 'pointer',
                zIndex: 2,
              }}
              title={h.ariaLabel}
              onFocus={(e) => (e.currentTarget.style.border = '2px solid var(--link)')}
              onBlur={(e) =>
                (e.currentTarget.style.border = showOutlines ? '2px solid var(--link)' : '2px solid transparent')
              }
            />
          ))}
        </div>

        {/* Progress row + outline toggle */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
          <span>Progress:</span>

          <span
            aria-label={
              seen.laptop ? (solved.laptop ? 'Laptop solved' : 'Laptop not yet solved') : 'Unknown challenge'
            }
            style={{ padding: '4px 8px', border: '1px solid var(--fg)', borderRadius: '8px', background: 'var(--bg)' }}
          >
            {seen.laptop ? (solved.laptop ? '✅ Laptop' : '⬜ Laptop') : '?'}
          </span>

          <span
            aria-label={
              seen.bookshelf ? (solved.bookshelf ? 'Bookshelf solved' : 'Bookshelf not yet solved') : 'Unknown challenge'
            }
            style={{ padding: '4px 8px', border: '1px solid var(--fg)', borderRadius: '8px', background: 'var(--bg)' }}
          >
            {seen.bookshelf ? (solved.bookshelf ? '✅ Bookshelf' : '⬜ Bookshelf') : '?'}
          </span>

          <span
            aria-label={seen.safe ? (solved.safe ? 'Safe solved' : 'Safe not yet solved') : 'Unknown challenge'}
            style={{ padding: '4px 8px', border: '1px solid var(--fg)', borderRadius: '8px', background: 'var(--bg)' }}
          >
            {seen.safe ? (solved.safe ? '✅ Safe' : '⬜ Safe') : '?'}
          </span>

          {/* Toggle is aligned to the right */}
          <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              checked={showOutlines}
              onChange={(e) => setShowOutlines(e.target.checked)}
              aria-label="Show challenge hotspots"
            />
            <span>Show challenge hotspots</span>
          </label>
        </div>

        {allSolved && (
          <div role="status" style={{ marginTop: '12px', padding: '10px', border: '1px solid var(--link)', borderRadius: '8px' }}>
            All puzzles solved — the door unlocks and you escape.
          </div>
        )}
      </section>

      {/* Challenge Modal */}
      {openId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dlg-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'grid',
            placeItems: 'center',
            padding: '16px',
            zIndex: 50,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeChallenge();
          }}
        >
          <div
            style={{
              width: 'min(100%, 980px)',
              border: '1px solid var(--fg)',
              borderRadius: '12px',
              background: 'var(--card)',
              color: 'var(--fg)',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <h2 id="dlg-title" style={{ margin: 0 }}>
                {CHALLENGES.find((c) => c.id === openId)!.title}
              </h2>
              <button onClick={closeChallenge} style={btn} aria-label="Close challenge">
                Close
              </button>
            </div>

            <p style={{ marginTop: 0 }}>{CHALLENGES.find((c) => c.id === openId)!.prompt}</p>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', margin: '8px 0' }}>
              <strong>Time left:</strong>
              <output aria-live="polite">{timeLeft > 0 && running ? `${timeLeft}s` : 'Stopped'}</output>
              {timeLeft <= 0 && <span> — Time’s up. You can reset to try again.</span>}
            </div>

            <label>
              <span style={{ display: 'block', marginBottom: 4 }}>
                Edit your code (implement <code>solve()</code> and return the value):
              </span>
              <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={12} spellCheck={false} style={mono} />
            </label>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
              <button onClick={run} style={primary} disabled={!running || timeLeft <= 0} aria-label="Run your code">
                Run
              </button>
              <button onClick={reset} style={btn} aria-label="Reset code and timer">
                Reset
              </button>
              <button
                onClick={() => setShowHint((v) => !v)}
                style={btn}
                aria-controls="hint-panel"
                aria-expanded={showHint}
                aria-label="Toggle hint"
              >
                Hint
              </button>
            </div>

            {/* Hint panel */}
            {current && showHint && (
              <div
                id="hint-panel"
                role="note"
                style={{
                  marginTop: '10px',
                  padding: '10px',
                  border: '1px dashed var(--fg)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                }}
              >
                <strong>Hint:</strong> {current.hint}
              </div>
            )}

            <div style={{ marginTop: '12px' }}>
              <h3 style={{ margin: '0 0 6px 0' }}>Result</h3>
              <div style={{ padding: '8px', border: '1px solid var(--fg)', borderRadius: '8px', background: 'var(--bg)' }}>
                {result || 'No result yet.'}
              </div>
            </div>

            {logs.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <h3 style={{ margin: '0 0 6px 0' }}>Console</h3>
                <pre style={{ ...mono, whiteSpace: 'pre-wrap' }}>{logs.join('\n')}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
