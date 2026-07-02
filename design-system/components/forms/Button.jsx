import React from 'react';

const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  fontFamily: 'var(--font-sans)',
  fontWeight: 'var(--weight-medium)',
  whiteSpace: 'nowrap',
  borderRadius: 'var(--radius-md)',
  border: '1px solid transparent',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out), opacity var(--duration-fast) var(--ease-out)',
  outline: 'none',
};

const sizes = {
  sm: { height: 32, padding: '0 12px', fontSize: 'var(--text-sm)' },
  md: { height: 40, padding: '0 16px', fontSize: 'var(--text-sm)' },
  lg: { height: 44, padding: '0 22px', fontSize: 'var(--text-base)' },
  icon: { height: 40, width: 40, padding: 0 },
};

const variants = {
  primary: {
    background: 'var(--primary)',
    color: 'var(--primary-foreground)',
    boxShadow: 'var(--shadow-xs)',
  },
  secondary: {
    background: 'var(--secondary)',
    color: 'var(--secondary-foreground)',
    border: '1px solid var(--border)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--foreground)',
  },
  destructive: {
    background: 'var(--destructive)',
    color: 'var(--destructive-foreground)',
    boxShadow: 'var(--shadow-xs)',
  },
  link: {
    background: 'transparent',
    color: 'var(--foreground)',
    textDecoration: 'underline',
    textUnderlineOffset: 4,
    height: 'auto',
    padding: 0,
  },
};

/**
 * Button — the primary action primitive.
 * Variants: primary | secondary | outline | ghost | destructive | link
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  style,
  children,
  ...props
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  const hoverStyle = !disabled && hover
    ? {
        primary: { background: 'color-mix(in oklab, var(--primary) 88%, var(--background))' },
        secondary: { background: 'var(--accent)' },
        outline: { background: 'var(--accent)' },
        ghost: { background: 'var(--accent)' },
        destructive: { background: 'color-mix(in oklab, var(--destructive) 88%, black)' },
        link: { opacity: 0.8 },
      }[variant]
    : null;

  return (
    <button
      type={type}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        ...base,
        ...s,
        ...v,
        ...hoverStyle,
        transform: active && !disabled ? 'scale(0.98)' : 'none',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        boxShadow: hover && !disabled ? `0 0 0 var(--ring-offset) var(--background), 0 0 0 calc(var(--ring-offset) + 1px) transparent` : v.boxShadow,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
