import React from 'react';

/** Tabs — segmented view switcher. */
export function Tabs({ tabs = [], value, defaultValue, onChange, style }) {
  const isControlled = value !== undefined;
  const first = defaultValue ?? (tabs[0] && (typeof tabs[0] === 'string' ? tabs[0] : tabs[0].value));
  const [internal, setInternal] = React.useState(first);
  const current = isControlled ? value : internal;

  const select = (val) => {
    if (!isControlled) setInternal(val);
    onChange && onChange(val);
  };

  return (
    <div
      role="tablist"
      style={{
        display: 'inline-flex',
        gap: 2,
        padding: 4,
        background: 'var(--secondary)',
        borderRadius: 'var(--radius-lg)',
        ...style,
      }}
    >
      {tabs.map((t) => {
        const val = typeof t === 'string' ? t : t.value;
        const lbl = typeof t === 'string' ? t : t.label;
        const selected = current === val;
        return (
          <button
            key={val}
            role="tab"
            aria-selected={selected}
            onClick={() => select(val)}
            style={{
              appearance: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 14px',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              borderRadius: 'var(--radius-md)',
              color: selected ? 'var(--foreground)' : 'var(--muted-foreground)',
              background: selected ? 'var(--card)' : 'transparent',
              boxShadow: selected ? 'var(--shadow-xs)' : 'none',
              transition: 'color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)',
            }}
          >
            {lbl}
          </button>
        );
      })}
    </div>
  );
}
