import React from 'react';

/** Skeleton — loading placeholder block with a shimmer. */
export function Skeleton({ width = '100%', height = 16, radius, style, ...props }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius != null ? radius : 'var(--radius-md)',
        background: 'linear-gradient(90deg, var(--secondary) 0%, color-mix(in oklab, var(--secondary) 60%, var(--card)) 50%, var(--secondary) 100%)',
        backgroundSize: '200% 100%',
        animation: 'ds-skeleton 1.4s ease-in-out infinite',
        ...style,
      }}
      {...props}
    >
      <style>{`@keyframes ds-skeleton{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}
