import React from 'react';

/** Textarea — multi-line text field. */
export function Textarea({ invalid = false, disabled = false, rows = 4, style, ...props }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <textarea
      rows={rows}
      disabled={disabled}
      onFocus={(e) => { setFocus(true); props.onFocus && props.onFocus(e); }}
      onBlur={(e) => { setFocus(false); props.onBlur && props.onBlur(e); }}
      style={{
        width: '100%',
        padding: '8px 12px',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        lineHeight: 'var(--leading-normal)',
        color: 'var(--foreground)',
        background: 'var(--card)',
        border: `1px solid ${invalid ? 'var(--destructive)' : focus ? 'var(--ring)' : 'var(--input)'}`,
        borderRadius: 'var(--radius-md)',
        outline: 'none',
        resize: 'vertical',
        boxShadow: focus ? `0 0 0 var(--ring-width) color-mix(in oklab, var(--ring) 30%, transparent)` : 'none',
        transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      {...props}
    />
  );
}
