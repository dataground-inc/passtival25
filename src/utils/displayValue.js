export const MISSING_VALUE = '미응시';

export function formatDisplayValue(value, formatPresentValue = String) {
  const isMissing = value === null
    || value === undefined
    || typeof value === 'string' && value.trim() === '';

  return isMissing ? MISSING_VALUE : formatPresentValue(value);
}
