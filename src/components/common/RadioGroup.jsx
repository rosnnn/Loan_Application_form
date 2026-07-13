import React, { forwardRef } from 'react';

const RadioGroup = forwardRef(({
  name, label, required, error, options, value, onChange, onBlur, layout = 'horizontal', className = '',
}, ref) => (
  <fieldset className={`mb-4 ${className}`} onBlur={onBlur}>
    {label && (
      <legend className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </legend>
    )}
    <div className={`flex gap-4 ${layout === 'vertical' ? 'flex-col' : 'flex-wrap'}`}>
      {options.map((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        const optLabel = typeof opt === 'string' ? opt : opt.label;
        const inputId = `${name}-${optValue}`;
        return (
          <label
            key={optValue}
            htmlFor={inputId}
            className="flex items-center gap-2 min-h-[44px] px-3 py-2 border border-slate-300 rounded-md cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <input
              type="radio"
              id={inputId}
              ref={ref}
              name={name}
              value={optValue}
              checked={value === optValue}
              onChange={onChange}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            <span className="text-sm text-slate-800">{optLabel}</span>
          </label>
        );
      })}
    </div>
    {error && (
      <p role="alert" aria-live="polite" className="mt-1 text-sm text-danger">
        {error}
      </p>
    )}
  </fieldset>
));
RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
