import React, { forwardRef, useState } from 'react';
import { maskPII } from '../../utils/formatters';

/**
 * MaskedInput - masks PII (PAN/Aadhaar) after the field loses focus,
 * revealing only the last 4 characters, per security requirements.
 * Shows an inline verification status (spinner / green tick / error).
 */
const MaskedInput = forwardRef(({
  id, label, required, error, helpText, value, onChange, onBlur, name,
  isVerifying, isVerified, className = '', ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const displayValue = !focused && value ? maskPII(value) : (value || '');

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          ref={ref}
          name={name}
          type="text"
          value={displayValue}
          onFocus={() => setFocused(true)}
          onChange={onChange}
          onBlur={(e) => {
            setFocused(false);
            if (onBlur) onBlur(e);
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full min-h-[44px] px-3 py-2 pr-10 border rounded-md text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? 'border-danger' : 'border-slate-300'
          } ${className}`}
          {...props}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2" aria-live="polite">
          {isVerifying && (
            <span
              className="inline-block h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"
              aria-label="Verifying"
            />
          )}
          {isVerified && !isVerifying && (
            <span className="text-accent" aria-label="Verified">&#10003;</span>
          )}
        </span>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" aria-live="polite" className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
      {helpText && <p className="mt-1 text-xs text-slate-500">{helpText}</p>}
    </div>
  );
});
MaskedInput.displayName = 'MaskedInput';

export default MaskedInput;
