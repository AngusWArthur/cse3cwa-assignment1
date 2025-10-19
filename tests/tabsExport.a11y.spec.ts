import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { toCssOnlyInteractiveHtml } from '@/lib/tabsExport';

describe('Tabs HTML generator — accessibility structure', () => {
  it('creates matching radios, labels, tablist, and tabpanels', () => {
    const tabs = [
      { title: 'One', content: 'First' },
      { title: 'Two', content: 'Second' },
      { title: 'Three', content: 'Third' },
    ];
    const html = toCssOnlyInteractiveHtml(tabs);

    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const tablist = doc.querySelector('[role="tablist"]');
    expect(tablist).not.toBeNull();

    const tabsEls = tablist!.querySelectorAll('[role="tab"]');
    const panels = doc.querySelectorAll('[role="tabpanel"]');
    const radios = doc.querySelectorAll('input[type="radio"]');

    expect(tabsEls.length).toBe(tabs.length);
    expect(panels.length).toBe(tabs.length);
    expect(radios.length).toBe(tabs.length);

    // Each label[role=tab] should point to a radio via "for", and to a panel via aria-controls
    tabsEls.forEach((label) => {
      const forId = (label as HTMLLabelElement).htmlFor;
      expect(forId).toMatch(/tabs-[\w-]+-tab-\d+/);
      const controls = label.getAttribute('aria-controls');
      expect(controls).toMatch(/tabs-[\w-]+-panel-\d+/);
      // There should be matching elements present
      expect(doc.getElementById(forId)).not.toBeNull();
      expect(doc.getElementById(controls!)).not.toBeNull();
    });
  });
});
