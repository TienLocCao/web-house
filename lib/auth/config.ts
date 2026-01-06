export const AUTH_CONFIG = {
  SESSION_DURATION:
    Number(process.env.ADMIN_SESSION_DAYS ?? 7) *
    24 * 60 * 60 * 1000,

  IDLE_TIMEOUT_MINUTES:
    Number(process.env.ADMIN_IDLE_TIMEOUT_MINUTES ?? 1440),
}

console.log("[AUTH CONFIG]", AUTH_CONFIG)