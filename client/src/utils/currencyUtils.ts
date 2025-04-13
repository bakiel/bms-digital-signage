/**
 * Currency utility functions for BMS Digital Signage
 * Implements proper formatting for currencies according to settings
 */
import { getSettings } from './settingsUtils';

// Cache for currency code to avoid repeated database calls
let cachedCurrencyCode: string | null = null;

/**
 * Get the current currency code from settings
 * Uses caching to avoid repeated database calls
 */
export const getCurrencyCode = async (): Promise<string> => {
  if (cachedCurrencyCode) {
    return cachedCurrencyCode;
  }
  
  try {
    const settings = await getSettings();
    cachedCurrencyCode = settings.default_currency || 'BWP';
    return cachedCurrencyCode;
  } catch (error) {
    console.error('Error fetching currency code:', error);
    return 'BWP'; // Default to BWP if there's an error
  }
};

/**
 * Format a number as currency according to settings
 * Format: "XXX XX.XX" (e.g., "BWP 10.50")
 * 
 * @param amount - The amount to format
 * @param currencyCode - Optional currency code (if not provided, uses settings)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currencyCode?: string): string => {
  // If currency code is provided, use it directly
  if (currencyCode) {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
  
  // If we have a cached currency code, use it
  if (cachedCurrencyCode) {
    return `${cachedCurrencyCode} ${amount.toFixed(2)}`;
  }
  
  // Default to BWP if no currency code is available yet
  // This will be shown briefly before the async code updates it
  return `BWP ${amount.toFixed(2)}`;
};

/**
 * Initialize the currency settings
 * Call this at app startup to preload the currency code
 */
export const initCurrencySettings = async (): Promise<void> => {
  await getCurrencyCode();
};

/**
 * Format a discounted price with original price and savings percentage
 * 
 * @param currentPrice - The current (discounted) price
 * @param originalPrice - The original price before discount
 * @returns Object with formatted price strings and discount percentage
 */
export const formatDiscountedPrice = (
  currentPrice: number,
  originalPrice: number
): { 
  currentFormatted: string;
  originalFormatted: string;
  savingsFormatted: string;
  discountPercentage: number;
} => {
  const savings = originalPrice - currentPrice;
  const discountPercentage = Math.round((savings / originalPrice) * 100);
  
  return {
    currentFormatted: formatCurrency(currentPrice),
    originalFormatted: formatCurrency(originalPrice),
    savingsFormatted: formatCurrency(savings),
    discountPercentage
  };
};

/**
 * Format a price with tier name (e.g., for school uniforms with sizes)
 * 
 * @param price - The price amount
 * @param tier - The tier name (e.g., "Size 4", "Small", etc.)
 * @returns Formatted tiered price string
 */
export const formatTieredPrice = (price: number, tier: string): string => {
  return `${tier}: ${formatCurrency(price)}`;
};

/**
 * Format multiple price tiers for display
 * 
 * @param prices - Array of price objects with tier_name and price
 * @returns Array of formatted price strings
 */
export const formatPriceTiers = (
  prices: Array<{ tier_name: string | null; price: number }>
): string[] => {
  return prices.map(price => {
    if (price.tier_name) {
      return formatTieredPrice(price.price, price.tier_name);
    } else {
      return formatCurrency(price.price);
    }
  });
};

/**
 * Calculate and format price range (when multiple tiers exist)
 * 
 * @param prices - Array of price objects
 * @returns Formatted price range string
 */
export const formatPriceRange = (
  prices: Array<{ price: number }>
): string => {
  if (!prices || prices.length === 0) {
    return formatCurrency(0);
  }
  
  if (prices.length === 1) {
    return formatCurrency(prices[0].price);
  }
  
  const lowestPrice = Math.min(...prices.map(p => p.price));
  const highestPrice = Math.max(...prices.map(p => p.price));
  
  if (lowestPrice === highestPrice) {
    return formatCurrency(lowestPrice);
  }
  
  return `${formatCurrency(lowestPrice)} - ${formatCurrency(highestPrice)}`;
};
