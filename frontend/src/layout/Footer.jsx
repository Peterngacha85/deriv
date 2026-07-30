export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="px-3 sm:px-6 py-4 text-center text-xs"
      style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
    >
      <div>&copy; {year} D'auto Traders. All rights reserved.</div>
      <div className="mt-1">
        Designed and developed by{' '}
        <a
          href="http://fastweb.co.ke"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium"
          style={{ color: 'var(--brand)' }}
        >
          Fastweb Technologies
        </a>
      </div>
    </footer>
  );
}
