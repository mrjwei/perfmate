import React from 'react';

/** Label — form field label. */
export function Label({ children, disabled = false, style, ...props }) {
  return (
    <label
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--weight-medium)',
        lineHeight: 'var(--leading-snug)',
        color: 'var(--foreground)',
        marginBottom: 'var(--space-2)',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      {...props}
    >
      {children}
    </label>
  );
}
