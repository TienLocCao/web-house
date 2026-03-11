/**
 * Cart Utilities and Hooks Export
 * Central place to import all cart-related utilities
 */

// Hooks
export { useCart, type CartItem } from './useCart'
export { useUserAuth, UserAuthProvider } from './useUserAuth'
export { useToast } from './useToast'

// Utilities
export {
  calculateSubtotal,
  calculateShipping,
  calculateTax,
  calculateDiscount,
  calculateOrderTotal,
  getFreeShippingMessage,
  findCartItem,
  getCartStats,
} from '@/lib/utils/cart'

export type {
  OrderTotal,
  CartStats,
} from '@/lib/utils/cart'
