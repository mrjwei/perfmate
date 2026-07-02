import React from 'react';

/** Card — surface container. Compose with CardHeader / CardTitle / CardDescription / CardContent / CardFooter. */
export function Card({ children, style, ...props }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', padding: 'var(--pad-card)', paddingBottom: 'var(--space-4)', ...style }} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, style, ...props }) {
  return (
    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)', lineHeight: 'var(--leading-snug)', ...style }} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, style, ...props }) {
  return (
    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', lineHeight: 'var(--leading-normal)', ...style }} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, style, ...props }) {
  return (
    <div style={{ padding: 'var(--pad-card)', paddingTop: 0, ...style }} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, style, ...props }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--pad-card)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)', ...style }} {...props}>
      {children}
    </div>
  );
}
