export default function Settings() {
  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <h1 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Settings
      </h1>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Trade risk, confidence threshold, and slippage/commission settings will live here, backed by the
        Settings collection already defined on the backend.
      </p>
    </div>
  );
}
