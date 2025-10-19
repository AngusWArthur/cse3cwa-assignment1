import { describe, it, expect, beforeAll } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { toCssOnlyInteractiveHtml } from "@/lib/tabsExport";

type TabInput = { title: string; content: string };

// Where to save the generated examples
const OUT_DIR = join(process.cwd(), "tests", "output");

// Three example tab sets (mutable arrays to satisfy TabInput[])
const CASES: TabInput[][] = [
  [{ title: "Overview", content: "Hello world" }],
  [
    { title: "Intro", content: "Line 1\nLine 2" },
    { title: "Details", content: "More info here" },
  ],
  [
    { title: "A11y", content: "ARIA roles and labels" },
    { title: "Styling", content: "Inline CSS only" },
    { title: "Export", content: "Copy the HTML into a file" },
  ],
];

beforeAll(() => {
  // Ensure tests/output exists
  mkdirSync(OUT_DIR, { recursive: true });
});

describe("Tabs HTML generator — examples output", () => {
  it("generates and writes three HTML examples", () => {
    CASES.forEach((tabs, i) => {
      const html = toCssOnlyInteractiveHtml(tabs);
      const file = join(OUT_DIR, `tabs-example-${i + 1}.html`);
      writeFileSync(file, html, "utf8");

      // Basic sanity checks
      expect(html).toContain("<!doctype html>");
      expect(html).toContain('<div role="tablist"');
    });
  });

  it("each example has at least one radio+label pair", () => {
    CASES.forEach((tabs) => {
      const html = toCssOnlyInteractiveHtml(tabs);
      // one radio per tab
      tabs.forEach((_t, i) => {
        expect(html).toContain(`type="radio"`);
        expect(html).toContain(`id="tabs-`);
        expect(html).toMatch(/role="tab"/);
        expect(html).toMatch(/role="tabpanel"/);
      });
    });
  });
});
