import React from 'react';

const styles = {
  solid:   { background: 'var(--primary)', color: 'var(--primary-foreground)', border: '1px solid transparent' },
  secondary: { background: 'var(--secondary)', color: 'var(--secondary-foreground)', border: '1px solid var(--border)' },
  outline: { background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)' },
  success: { background: 'color-mix(in oklab, var(--success) 14%, var(--card))', color: 'var(--success)', border: '1px solid color-mix(in oklab, var(--success) 30%, transparent)' },
  warning: { background: 'color-mix(in oklab, var(--warning) 16%, var(--card))', color: 'color-mix(in oklab, var(--warning) 70%, black)', border: '1px solid color-mix(in oklab, var(--warning) 35%, transparent)' },
  destructive: { background: 'color-mix(in oklab, var(--destructive) 12%, var(--card))', color: 'var(--destructive)', border: '1px solid color-mix(in oklab, var(--destructive) 30%, transparent)' },
};

/** Badge — compact status / category label. */
export function Badge({ variant = 'solid', children, style, ...props }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        height: 22,
        padding: '0 8px',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-medium)',
        lineHeight: 1,
        borderRadius: 'var(--radius-full)',
        whiteSpace: 'nowrap',
        ...(styles[variant] || styles.solid),
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
