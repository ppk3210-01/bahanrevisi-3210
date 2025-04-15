
/**
 * Format a number as currency
 * @param value Number to format
 * @param includeSymbol Whether to include the Rp symbol
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | null | undefined, includeSymbol = false): string => {
  if (value === null || value === undefined) return '-';
  
  const formattedValue = new Intl.NumberFormat('id-ID').format(Math.round(value));
  return includeSymbol ? `Rp ${formattedValue}` : formattedValue;
};

/**
 * Format a number with rounding to thousands
 * @param value Number to format
 * @returns Rounded number
 */
export const formatRoundedThousand = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  
  const rounded = Math.round(value / 1000) * 1000;
  return formatCurrency(rounded);
};
