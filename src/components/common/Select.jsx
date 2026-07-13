import React, { forwardRef } from 'react';

const Select = forwardRef(({
  id, label, required, error, helpText, options, placeholder = 'Select an option', className = '', ...props
}, ref) => (
  <div className="mb-4">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
    )}
    <select
      id={id}
      ref={ref}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`w-full min-h-[44px] px-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary ${
        error ? 'border-danger' : 'border-slate-300'
      } ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
          {typeof opt === 'string' ? opt : opt.label}
        </option>
      ))}
    </select>
    {error && (
      <p id={`${id}-error`} role="alert" aria-live="polite" className="mt-1 text-sm text-danger">
        {error}
      </p>
    )}
    {helpText && <p className="mt-1 text-xs text-slate-500">{helpText}</p>}
  </div>
));
Select.displayName = 'Select';

export default Select;
