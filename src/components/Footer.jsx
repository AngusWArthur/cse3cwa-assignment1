'use client';

export default function Footer() {
  const today = new Date().toLocaleDateString('en-AU', { year:'numeric', month:'long', day:'2-digit' });
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div>©Angus Arthur (21819446) {new Date().getFullYear()}. All rights reserved. </div>
      </div>
    </footer>
  );
}
