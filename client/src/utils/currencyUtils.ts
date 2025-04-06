/**
 * Currency utility functions for BMS Digital Signage
 * Handles Botswana Pula (BWP) formatting and discount calculations
 */

/**
 * Format a number as Botswana Pula (BWP)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "BWP 42.50")
 */
export const formatCurrency = (amount: number): string => {
  return `BWP ${amount.toFixed(2)}`;
};

/**
 * Format a price with discount information
 * @param currentPrice - The current (discounted) price
 * @param originalPrice - The original price before discount (null if no discount)
 * @returns Object with formatted prices and discount percentage
 */
export const formatDiscountedPrice = (
  currentPrice: number,
  originalPrice: number | null
) => {
  if (!originalPrice || originalPrice <= currentPrice) {
    return {
      formattedPrice: formatCurrency(currentPrice),
      formattedOriginal: null,
      discount: null
    };
  }

  const discountPercentage = Math.round((1 - currentPrice / originalPrice) * 100);
  
  return {
    formattedPrice: formatCurrency(currentPrice),
    formattedOriginal: formatCurrency(originalPrice),
    discount: discountPercentage
  };
};

/**
 * Format a tiered price (e.g., for uniform sizes)
 * @param price - The price amount
 * @param tier - The tier name (e.g., "Small", "Medium", "Large")
 * @returns Formatted string with tier and price
 */
export const formatTieredPrice = (price: number, tier: string): string => {
  return `${tier}: ${formatCurrency(price)}`;
};