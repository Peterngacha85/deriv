import { useState } from 'react';

/**
 * Collapsed-by-default container for secondary detail — keeps the primary
 * screen to one clear action while still making every feature reachable.
 */
export default function ExpandableSection({ title, subtitle, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="flex flex-col">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </span>
          {subtitle && (
            <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className="text-xs shrink-0 transition-transform duration-300"
          style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾ {open ? 'Hide' : 'Show'}
        </span>
      </button>
      <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 flex flex-col gap-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
