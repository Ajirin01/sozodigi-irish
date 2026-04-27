const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM || "global";

export const CURRENCY_CODE = PLATFORM === "irish" ? "EUR" : "USD";
export const CURRENCY_SYMBOL = PLATFORM === "irish" ? "€" : "$";

/**
 * Formats a numeric amount into a currency string based on the current platform.
 * @param {number} amount - The amount to format
 * @returns {string} The formatted currency string
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY_CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
