import React from 'react';

/** Separator — thin divider line. */
export function Separator({ orientation = 'horizontal', style, ...props }) {
  const horizontal = orientation === 'horizontal';
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      style={{
        background: 'var(--border)',
        flexShrink: 0,
        width: horizontal ? '100%' : 1,
        height: horizontal ? 1 : '100%',
        ...style,
      }}
      {...props}
    />
  );
}
