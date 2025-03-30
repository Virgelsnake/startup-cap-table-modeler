/**
 * Formats a number according to the specified type (currency, shares, percentage).
 * @param value The number to format.
 * @param type The type of formatting ('currency', 'shares', 'percentage').
 * @param maximumFractionDigits The maximum number of fraction digits (defaults based on type).
 * @returns The formatted string.
 */
export function formatNumber(
  value: number | undefined | null,
  type: 'currency' | 'shares' | 'percentage',
  maximumFractionDigits?: number
): string {
  if (value === undefined || value === null || isNaN(value)) {
    // Return empty string or placeholder for invalid inputs
    return type === 'currency' ? '$0' : '0'; 
  }

  let options: Intl.NumberFormatOptions = {};

  switch (type) {
    case 'currency':
      // Special case for price per share which might need decimal places
      if (maximumFractionDigits && maximumFractionDigits > 2) {
        options = {
          style: 'decimal',
          minimumFractionDigits: maximumFractionDigits,
          maximumFractionDigits: maximumFractionDigits,
        };
        return `$${value.toLocaleString('en-US', options)}`;
      } else {
        // For regular currency values, use whole dollars only (no cents)
        options = {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        };
      }
      break;
    case 'shares':
      options = {
        style: 'decimal',
        maximumFractionDigits: 0, // No decimals for shares
      };
      break;
    case 'percentage':
      options = {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      };
      // The input value for percentage should be the decimal form (e.g., 0.5 for 50%)
      break;
    default:
      options = {
        style: 'decimal',
        maximumFractionDigits: 2,
      };
  }

  try {
     // Special handling for percentage to ensure it displays correctly if passed as 50 instead of 0.5
     // Note: Intl.NumberFormat expects decimal for percentage style, so we don't divide here.
     // If your state stores percentages as 0-100, divide by 100 before passing to this function
     // or adjust the logic here. Assuming state stores decimal form (e.g. 0.5 for 50%).
    return value.toLocaleString('en-US', options);
  } catch (e) {
    console.error("Error formatting number:", e);
    return String(value); // Fallback to simple string conversion
  }
}

/**
 * Parses a formatted string (potentially with commas or currency symbols) into a number.
 * Returns NaN for invalid or intermediate inputs to allow smoother typing.
 * @param value The string value to parse.
 * @returns The parsed number, or NaN if parsing is incomplete or fails.
 */
export function parseFormattedNumber(value: string): number {
  if (typeof value !== 'string' || value.trim() === '') return NaN; // Return NaN for empty or non-string
  // Remove currency symbols, commas, and spaces BUT keep the decimal point for intermediate typing
  const cleanedValue = value.replace(/[$,\s]/g, '');

  // Prevent parsing if it's just a symbol or partial number like '.'
  if (cleanedValue === '.' || cleanedValue === '-') return NaN;

  // Check if it ends with a decimal but has digits before it (e.g., "1.") - allow this intermediate state
  const number = parseFloat(cleanedValue);

  // If parseFloat results in NaN, return NaN
  // Otherwise, return the number. The caller (onChange handler) will decide how to treat NaN.
  return number; 
}
