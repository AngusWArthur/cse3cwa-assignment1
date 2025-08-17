'use client';

export default function Footer() {
  const today = new Date().toLocaleDateString('en-AU', { year:'numeric', month:'long', day:'2-digit' });
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div>© {new Date().getFullYear()} Angus Arthur — Student No. 21819446 — {today}</div>
      </div>
    </footer>
  );
}
