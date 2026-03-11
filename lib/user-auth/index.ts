// Types
export type { User, Address, UserSession } from "./types"

// Config
export { USER_AUTH_CONFIG } from "./config"

// Session management
export {
  createUserSession,
  getUserSession,
  destroyUserSession,
  refreshUserSession,
} from "./session"

// Validation
export {
  validateUserSession,
  validateUserSessionFromRequest,
  validateUserForLogin,
} from "./validation"

// Middleware
export {
  requireUserAuth,
  hasUserRole,
} from "./middleware"