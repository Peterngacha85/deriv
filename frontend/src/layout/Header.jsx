import ConnectionBadge from '../components/ConnectionBadge';
import { useMarket } from '../context/MarketContext';

export default function Header() {
  const { snapshot } = useMarket();
  const connection = snapshot?.connection || {};
  const balance = snapshot?.balance;

  return (
    <header
      className="flex items-center justify-between px-6 py-3"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-1)' }}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center rounded-lg font-bold text-sm"
          style={{ width: '30px', height: '30px', background: 'var(--brand)', color: '#fff' }}
        >
          B
        </span>
        <span className="font-semibold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
          BS Traders
        </span>
      </div>
      <div className="flex items-center gap-5">
        <ConnectionBadge connected={connection.marketDataConnected} label="Market data" />
        <ConnectionBadge connected={connection.accountConnected} label="Account" />
        {balance && (
          <span
            className="text-sm font-semibold tabular px-3 py-1.5 rounded-full"
            style={{ color: '#fff', background: 'var(--brand)' }}
          >
            {balance.balance.toFixed(2)} {balance.currency}
          </span>
        )}
      </div>
    </header>
  );
}
