import React, { forwardRef } from 'react';

const Checkbox = forwardRef(({
  id, label, error, className = '', ...props
}, ref) => (
  <div className={`mb-4 ${className}`}>
    <label htmlFor={id} className="flex items-start gap-3 min-h-[44px] cursor-pointer">
      <input
        type="checkbox"
        id={id}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary flex-shrink-0"
        {...props}
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
    {error && (
      <p id={`${id}-error`} role="alert" aria-live="polite" className="mt-1 text-sm text-danger ml-8">
        {error}
      </p>
    )}
  </div>
));
Checkbox.displayName = 'Checkbox';

export default Checkbox;
