import React, { forwardRef } from 'react';

const Label = ({ children, htmlFor, required }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">
    {children}
    {required && <span className="text-danger ml-0.5">*</span>}
  </label>
);

const Field = forwardRef(({
  id, error, className = '', ...props
}, ref) => (
  <input
    id={id}
    ref={ref}
    aria-invalid={!!error}
    aria-describedby={error ? `${id}-error` : undefined}
    className={`w-full min-h-[44px] px-3 py-2 border rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-2 transition-colors ${
      error ? 'border-danger' : 'border-slate-300'
    } ${className}`}
    {...props}
  />
));
Field.displayName = 'Input.Field';

const Error = ({ id, children }) => {
  if (!children) return null;
  return (
    <p id={`${id}-error`} role="alert" aria-live="polite" className="mt-1 text-sm text-danger">
      {children}
    </p>
  );
};

const HelpText = ({ children }) => {
  if (!children) return null;
  return <p className="mt-1 text-xs text-slate-500">{children}</p>;
};

const Input = forwardRef(({
  id, label, required, error, helpText, ...props
}, ref) => (
  <div className="mb-4">
    {label && <Label htmlFor={id} required={required}>{label}</Label>}
    <Field id={id} error={error} ref={ref} {...props} />
    <Error id={id}>{error}</Error>
    <HelpText>{helpText}</HelpText>
  </div>
));
Input.displayName = 'Input';

Input.Label = Label;
Input.Field = Field;
Input.Error = Error;
Input.HelpText = HelpText;

export default Input;
