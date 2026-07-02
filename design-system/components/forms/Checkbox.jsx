import React from 'react';

/** Checkbox — controlled or uncontrolled boolean toggle with a label slot. */
export function Checkbox({ checked, defaultChecked = false, onChange, disabled = false, label, id, style, ...props }) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(defaultChecked);
  const value = isControlled ? checked : internal;
  const [hover, setHover] = React.useState(false);

  const toggle = () => {
    if (disabled) return;
    const next = !value;
    if (!isControlled) setInternal(next);
    onChange && onChange(next);
  };

  const box = (
    <span
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        flexShrink: 0,
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${value ? 'var(--primary)' : hover ? 'var(--ring)' : 'var(--input)'}`,
        background: value ? 'var(--primary)' : 'var(--card)',
        color: 'var(--primary-foreground)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {value && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </span>
  );

  if (!label) return box;
  return (
    <label htmlFor={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--foreground)', opacity: disabled ? 0.6 : 1, ...style }}>
      {box}
      <span>{label}</span>
    </label>
  );
}
