/**
 * Formats a number using the Indian numbering system (lakh/crore grouping)
 * e.g. 1050000 -> "10,50,000"
 */
export function formatIndianNumber(value) {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return '';
  return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatINR(value) {
  const formatted = formatIndianNumber(value);
  return formatted ? `\u20B9${formatted}` : '';
}

export function maskPII(value, visibleChars = 4) {
  if (!value) return '';
  const str = String(value);
  if (str.length <= visibleChars) return str;
  const masked = 'X'.repeat(str.length - visibleChars);
  return `${masked}${str.slice(-visibleChars)}`;
}

export function parseCurrencyInput(value) {
  if (typeof value !== 'string') return value;
  return Number(value.replace(/[^0-9.]/g, ''));
}
