import React from 'react';

const tones = {
  info:    { fg: 'var(--foreground)', accent: 'var(--info)', bg: 'var(--card)' },
  success: { fg: 'var(--foreground)', accent: 'var(--success)', bg: 'color-mix(in oklab, var(--success) 7%, var(--card))' },
  warning: { fg: 'var(--foreground)', accent: 'var(--warning)', bg: 'color-mix(in oklab, var(--warning) 9%, var(--card))' },
  destructive: { fg: 'var(--destructive)', accent: 'var(--destructive)', bg: 'color-mix(in oklab, var(--destructive) 6%, var(--card))' },
};

const icons = {
  info: <path d="M12 16v-4M12 8h.01" />,
  success: <path d="M20 6 9 17l-5-5" />,
  warning: <><path d="M12 9v4M12 17h.01" /><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /></>,
  destructive: <><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></>,
};

/** Alert — inline contextual message. */
export function Alert({ tone = 'info', title, children, style, ...props }) {
  const t = tones[tone] || tones.info;
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        background: t.bg,
        border: `1px solid ${tone === 'info' ? 'var(--border)' : `color-mix(in oklab, ${t.accent} 28%, transparent)`}`,
        borderRadius: 'var(--radius-lg)',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      {...props}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
        {tone === 'info' && <circle cx="12" cy="12" r="10" />}
        {icons[tone]}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {title && <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: t.fg }}>{title}</div>}
        {children && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', lineHeight: 'var(--leading-normal)' }}>{children}</div>}
      </div>
    </div>
  );
}
