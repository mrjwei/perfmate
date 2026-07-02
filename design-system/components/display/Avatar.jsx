import React from 'react';

/** Avatar — user image with initials fallback. */
export function Avatar({ src, name = '', size = 40, style, ...props }) {
  const [error, setError] = React.useState(false);
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        background: 'var(--secondary)',
        color: 'var(--secondary-foreground)',
        fontFamily: 'var(--font-sans)',
        fontSize: Math.round(size * 0.38),
        fontWeight: 'var(--weight-medium)',
        userSelect: 'none',
        ...style,
      }}
      {...props}
    >
      {src && !error ? (
        <img src={src} alt={name} onError={() => setError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials || '?'
      )}
    </span>
  );
}
