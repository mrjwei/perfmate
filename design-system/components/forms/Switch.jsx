import React from 'react';

/** Switch — on/off toggle. */
export function Switch({ checked, defaultChecked = false, onChange, disabled = false, label, style, ...props }) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(defaultChecked);
  const value = isControlled ? checked : internal;

  const toggle = () => {
    if (disabled) return;
    const next = !value;
    if (!isControlled) setInternal(next);
    onChange && onChange(next);
  };

  const track = (
    <span
      role="switch"
      aria-checked={value}
      onClick={toggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        width: 36,
        height: 20,
        flexShrink: 0,
        padding: 2,
        borderRadius: 'var(--radius-full)',
        background: value ? 'var(--primary)' : 'var(--neutral-300)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--duration-base) var(--ease-out)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 'var(--radius-full)',
          background: 'var(--card)',
          boxShadow: 'var(--shadow-sm)',
          transform: value ? 'translateX(16px)' : 'translateX(0)',
          transition: 'transform var(--duration-base) var(--ease-out)',
        }}
      />
    </span>
  );

  if (!label) return track;
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--foreground)', opacity: disabled ? 0.6 : 1, ...style }}>
      {track}
      <span>{label}</span>
    </label>
  );
}
