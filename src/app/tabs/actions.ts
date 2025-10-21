'use server';

export async function logTabsView() {
  (globalThis as any).__log?.('VIEW /tabs');
}
