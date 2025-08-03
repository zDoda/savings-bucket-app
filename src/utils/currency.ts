// Utility functions for handling currency calculations with proper precision

/**
 * Rounds a number to the nearest cent (2 decimal places)
 */
export const roundToCents = (value: number): number => {
  return Math.round(value * 100) / 100;
};

/**
 * Formats a number as currency string
 */
export const formatCurrency = (value: number): string => {
  return roundToCents(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Safely adds two currency values
 */
export const addCurrency = (a: number, b: number): number => {
  return roundToCents(a + b);
};

/**
 * Safely subtracts two currency values
 */
export const subtractCurrency = (a: number, b: number): number => {
  return roundToCents(a - b);
};

/**
 * Safely multiplies a currency value by a factor
 */
export const multiplyCurrency = (value: number, factor: number): number => {
  return roundToCents(value * factor);
};