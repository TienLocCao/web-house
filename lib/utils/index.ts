// UI utilities
export { cn } from "./cn"

// API client
export { apiClient } from "./api-client"

// Secure fetch utilities
export { secureFetch, secureFetchJSON } from "./secure-fetch"

// Logger
export { logger } from "./logger"

// Request utilities
export { getClientIP } from "./request"

// Validation utilities
export {
  ProductQuerySchema,
  ProductCreateSchema,
  ReviewCreateSchema,
  ContactFormSchema,
  NewsletterSchema,
  OrderCreateSchema,
  sanitizeInput,
} from "./validation"
export type { RateLimitResult } from "./validation"

// Currency utilities
export {
  formatVND,
  parseVND,
  displayPrice,
  CURRENCY,
} from "./currency"
