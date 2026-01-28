/**
 * Cart utilities - Pure functions for cart calculations
 */

export interface CartItem {
  id: number
  name: string
  slug: string
  price: number
  quantity: number
  image_url: string
  material: string
  color: string
}

/**
 * Calculate subtotal from cart items
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

/**
 * Calculate shipping cost
 * Free shipping for orders over $500
 */
export function calculateShipping(subtotal: number, threshold = 500, cost = 45): number {
  return subtotal > threshold ? 0 : cost
}

/**
 * Calculate tax (10%)
 */
export function calculateTax(subtotal: number, rate = 0.1): number {
  return Math.round((subtotal * rate) * 100) / 100
}

/**
 * Apply promo code discount
 */
export interface PromoCode {
  code: string
  discount: number // 0-1 (20% = 0.2)
}

const VALID_PROMO_CODES: Record<string, number> = {
  'WELCOME20': 0.2,
  'SAVE10': 0.1,
  'SUMMER15': 0.15,
  'VIPFREE': 0,
}

export function validatePromoCode(code: string): PromoCode | null {
  const upperCode = code.toUpperCase().trim()
  if (upperCode in VALID_PROMO_CODES) {
    return {
      code: upperCode,
      discount: VALID_PROMO_CODES[upperCode],
    }
  }
  return null
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(subtotal: number, discountRate: number): number {
  return Math.round((subtotal * discountRate) * 100) / 100
}

/**
 * Calculate order total
 */
export interface OrderTotal {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
}

export function calculateOrderTotal(
  items: CartItem[],
  promoCodeDiscount = 0,
  taxRate = 0.1,
  shippingThreshold = 500,
  shippingCost = 45
): OrderTotal {
  const subtotal = calculateSubtotal(items)
  const discount = calculateDiscount(subtotal, promoCodeDiscount)
  const afterDiscount = subtotal - discount
  const shipping = calculateShipping(afterDiscount, shippingThreshold, shippingCost)
  const tax = calculateTax(afterDiscount + shipping, taxRate)
  const total = afterDiscount + shipping + tax

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: Math.round(total * 100) / 100,
  }
}

/**
 * Get free shipping threshold message
 */
export function getFreeShippingMessage(subtotal: number, threshold = 500): string | null {
  if (subtotal >= threshold) {
    return '✓ Free shipping applied!'
  }
  const remaining = threshold - subtotal
  return `Add $${remaining.toFixed(2)} more for FREE shipping!`
}

/**
 * Check if item already exists in cart
 */
export function findCartItem(items: CartItem[], productId: number): CartItem | undefined {
  return items.find(item => item.id === productId)
}

/**
 * Get cart summary stats
 */
export interface CartStats {
  itemCount: number
  uniqueItems: number
  totalPrice: number
}

export function getCartStats(items: CartItem[]): CartStats {
  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    uniqueItems: items.length,
    totalPrice: calculateSubtotal(items),
  }
}
