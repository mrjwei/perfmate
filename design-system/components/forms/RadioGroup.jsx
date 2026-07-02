import React from 'react';

/** RadioGroup — single-select from a list of options. */
export function RadioGroup({ options = [], value, defaultValue, onChange, name, disabled = false, style }) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const current = isControlled ? value : internal;

  const select = (val) => {
    if (disabled) return;
    if (!isControlled) setInternal(val);
    onChange && onChange(val);
  };

  return (
    <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', ...style }}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const lbl = typeof opt === 'string' ? opt : opt.label;
        const selected = current === val;
        return (
          <label key={val} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--foreground)', opacity: disabled ? 0.6 : 1 }}>
            <span
              onClick={() => select(val)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                flexShrink: 0,
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${selected ? 'var(--primary)' : 'var(--input)'}`,
                background: 'var(--card)',
                transition: 'border-color var(--duration-fast) var(--ease-out)',
              }}
            >
              {selected && (
                <span style={{ width: 9, height: 9, borderRadius: 'var(--radius-full)', background: 'var(--primary)' }} />
              )}
            </span>
            <span>{lbl}</span>
          </label>
        );
      })}
    </div>
  );
}
