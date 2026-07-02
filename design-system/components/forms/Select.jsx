import React from 'react';

/** Select — styled single-choice dropdown (native under the hood). */
export function Select({ options = [], value, defaultValue, onChange, placeholder, size = 'md', disabled = false, style, ...props }) {
  const [focus, setFocus] = React.useState(false);
  const heights = { sm: 32, md: 40, lg: 44 };
  return (
    <div style={{ position: 'relative', display: 'inline-block', width: style?.width || '100%' }}>
      <select
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          height: heights[size] || 40,
          width: '100%',
          padding: '0 36px 0 12px',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          color: 'var(--foreground)',
          background: 'var(--card)',
          border: `1px solid ${focus ? 'var(--ring)' : 'var(--input)'}`,
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: focus ? `0 0 0 var(--ring-width) color-mix(in oklab, var(--ring) 30%, transparent)` : 'none',
          transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
          opacity: disabled ? 0.5 : 1,
          ...style,
        }}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
