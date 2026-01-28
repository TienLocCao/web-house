/**
 * Currency utilities for VND formatting
 */

export const CURRENCY = {
  code: 'VND',
  symbol: '₫',
  exchangeRate: 1, // Base currency
} as const

/**
 * Format number to VND currency
 * @param amount - Amount in VND
 * @param useSymbol - Whether to use ₫ symbol (default: true)
 * @returns Formatted currency string
 * @example
 * formatVND(1500000) => "1.500.000₫"
 * formatVND(1500000, false) => "1.500.000"
 */
export function formatVND(amount: number, useSymbol = true): string {
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  if (useSymbol) {
    return formatted
  }

  // Remove ₫ if not needed
  return formatted.replace(/₫\s?/, '').trim()
}

/**
 * Parse formatted VND string back to number
 * @param formatted - Formatted VND string like "1.500.000₫"
 * @returns Number value
 */
export function parseVND(formatted: string): number {
  return Number(formatted.replace(/[^\d]/g, ''))
}

/**
 * Format for display in UI (with thousand separator)
 * @param amount - Amount in VND
 * @returns Formatted string with symbol
 */
export function displayPrice(amount: number): string {
  return formatVND(amount, true)
}
