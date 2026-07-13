import React, { forwardRef, useState, useEffect } from 'react';
import { formatIndianNumber } from '../../utils/formatters';

/**
 * CurrencyInput - works both as a controlled component (value/onChange) and
 * as an uncontrolled component compatible with React Hook Form's register().
 * Displays Indian-formatted digits (e.g. 10,50,000) while keeping the
 * underlying numeric value clean for validation.
 */
const CurrencyInput = forwardRef(({
  id, label, required, error, helpText, value, onChange, onBlur, name, className = '', ...props
}, ref) => {
  const [displayValue, setDisplayValue] = useState(value !== undefined ? formatIndianNumber(value) : '');

  useEffect(() => {
    if (value !== undefined) setDisplayValue(formatIndianNumber(value));
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setDisplayValue(raw ? formatIndianNumber(raw) : '');
    if (onChange) {
      onChange({ target: { name, value: raw } });
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">&#8377;</span>
        <input
          id={id}
          ref={ref}
          name={name}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full min-h-[44px] pl-8 pr-3 py-2 border rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? 'border-danger' : 'border-slate-300'
          } ${className}`}
          {...props}
        />
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
CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
