export const USER_AUTH_CONFIG = {
  SESSION_DURATION:
    Number(process.env.USER_SESSION_DAYS ?? 30) *
    24 * 60 * 60 * 1000,

  IDLE_TIMEOUT_MINUTES:
    Number(process.env.USER_IDLE_TIMEOUT_MINUTES ?? 1440),
};