import React from 'react';

/** Progress — determinate progress bar (0–100). */
export function Progress({ value = 0, size = 'md', style, ...props }) {
  const heights = { sm: 4, md: 8, lg: 12 };
  const h = heights[size] || 8;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        width: '100%',
        height: h,
        background: 'var(--secondary)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: 'var(--primary)',
          borderRadius: 'var(--radius-full)',
          transition: 'width var(--duration-slow) var(--ease-out)',
        }}
      />
    </div>
  );
}
