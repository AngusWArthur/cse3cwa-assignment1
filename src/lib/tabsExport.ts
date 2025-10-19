// src/lib/tabsExport.ts
export type TabInput = { title: string; content: string };

/* ---- helpers (exported for optional reuse in tests) ---- */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (m) =>
    m === '&' ? '&amp;' :
    m === '<' ? '&lt;' :
    m === '>' ? '&gt;' :
    m === '"' ? '&quot;' :
    '&#39;'
  );
}

/** Render plain text content to HTML with <br> for line breaks */
export function textToHtml(s: string): string {
  return escapeHtml(s).replace(/\r?\n/g, '<br>');
}

/**
 * Generate a standalone CSS-only interactive HTML document using radio+label technique.
 * No classes are used; selectors rely on element/attribute/ID only.
 */
export function toCssOnlyInteractiveHtml(
  tabs: ReadonlyArray<TabInput>
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

  const radios = tabs
    .map((_, i) => {
      const checked = i === 0 ? ' checked' : '';
      return `  <input type="radio" name="${uid}-set" id="${uid}-tab-${i}"${checked} aria-controls="${uid}-panel-${i}" />`;
    })
    .join('\n');

  const labels = tabs
    .map((t, i) => {
      const title = escapeHtml(t.title || `Tab ${i + 1}`);
      return `      <label for="${uid}-tab-${i}" role="tab" aria-controls="${uid}-panel-${i}">${title}</label>`;
    })
    .join('\n');

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
