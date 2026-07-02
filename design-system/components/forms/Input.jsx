import React from 'react';

/**
 * Input — single-line text field.
 */
export function Input({ size = 'md', invalid = false, disabled = false, style, ...props }) {
  const [focus, setFocus] = React.useState(false);
  const heights = { sm: 32, md: 40, lg: 44 };
  return (
    <input
      disabled={disabled}
      onFocus={(e) => { setFocus(true); props.onFocus && props.onFocus(e); }}
      onBlur={(e) => { setFocus(false); props.onBlur && props.onBlur(e); }}
      style={{
        height: heights[size] || 40,
        width: '100%',
        padding: '0 12px',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        color: 'var(--foreground)',
        background: 'var(--card)',
        border: `1px solid ${invalid ? 'var(--destructive)' : focus ? 'var(--ring)' : 'var(--input)'}`,
        borderRadius: 'var(--radius-md)',
        outline: 'none',
        boxShadow: focus ? `0 0 0 var(--ring-width) color-mix(in oklab, ${invalid ? 'var(--destructive)' : 'var(--ring)'} 30%, transparent)` : 'none',
        transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      {...props}
    />
  );
}
