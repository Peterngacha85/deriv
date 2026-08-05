import { useState } from 'react';

/**
 * Collapsed-by-default reveal for secondary detail — keeps the default screen
 * down to one clear focus while still making every feature reachable in a tap.
 * The toggle reads as a card; the revealed content sits on the page background
 * so the cards inside it keep their own contrast instead of nesting flat.
 */
export default function ExpandableSection({ title, subtitle, icon, accent = 'var(--text-muted)', defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="card-hover w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-left"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderLeft: `4px solid ${accent}` }}
      >
        <span className="flex items-center gap-3 min-w-0">
          {icon && (
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center rounded-full shrink-0"
              style={{ width: '32px', height: '32px', background: `color-mix(in srgb, ${accent} 18%, transparent)`, fontSize: '15px' }}
            >
              {icon}
            </span>
          )}
          <span className="flex flex-col min-w-0">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </span>
            {subtitle && (
              <span className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {subtitle}
              </span>
            )}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="text-xs font-semibold shrink-0 px-2.5 py-1 rounded-full"
          style={{ color: accent, background: `color-mix(in srgb, ${accent} 16%, transparent)` }}
        >
          {open ? 'Hide' : 'Show'}
        </span>
      </button>
      <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-8 pb-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
