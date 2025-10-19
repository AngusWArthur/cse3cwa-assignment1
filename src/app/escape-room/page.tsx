// Server Component (no "use client")
export const metadata = { title: 'CSE3CWA - Escape Room' };

import EscapeRoomClient from './EscapeRoomClient';

export default function Page() {
  return <EscapeRoomClient />;
}
