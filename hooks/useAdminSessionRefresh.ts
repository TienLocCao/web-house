// File: [hooks/useAdminSessionRefresh.ts](hooks/useAdminSessionRefresh.ts)
import { useCallback, useEffect, useRef } from "react"

type Options = {
  intervalMs?: number
  idleTimeoutMs?: number | null
  refreshUrl?: string
  logoutRedirect?: string
  onLogout?: () => void
}

const ADMIN_LAST_ACTIVE_KEY = "admin-last-active"

export function useAdminSessionRefresh({
  intervalMs = 1000 * 60 * 60 * 12, // default 12 hours
  idleTimeoutMs = 1000 * 60 * 60 * 24, // set to ms to enable idle logout
  refreshUrl = "/api/admin/auth/refresh",
  logoutRedirect = "/admin/login",
  onLogout,
}: Options = {}) {
  const timerRef = useRef<number | null>(null)
  const idleRef = useRef<number | null>(null)
  const bcRef = useRef<BroadcastChannel | null>(null)

  const performLogout = useCallback(async (notify = true) => {
    try {
      // optional: call server logout endpoint to clear cookie/session
      await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" })
    } catch (e) {
      // ignore network errors; still proceed to client-side logout
    }

    try {
      localStorage.removeItem(ADMIN_LAST_ACTIVE_KEY)
    } catch {}

    if (notify && typeof BroadcastChannel !== "undefined") {
      try {
        bcRef.current?.postMessage({ type: "admin-logout" })
      } catch {}
    } else {
      try {
        localStorage.setItem("admin-logout", String(Date.now()))
      } catch {}
    }

    if (onLogout) onLogout()
    // redirect to login
    if (typeof window !== "undefined") window.location.href = logoutRedirect
  }, [onLogout, logoutRedirect])

  const handleRefreshResponse = useCallback(async () => {
    try {
      const res = await fetch(refreshUrl, { method: "POST", credentials: "include" })
      if (res.status === 401 || !res.ok) {
        performLogout()
      }
    } catch (err) {
      // network error: don't logout immediately, but could retry next interval.
      console.error("Session refresh failed", err)
    }
  }, [refreshUrl, performLogout])

  const resetIdle = useCallback(() => {
    if (!idleTimeoutMs) return

    try {
      localStorage.setItem(ADMIN_LAST_ACTIVE_KEY, Date.now().toString())
    } catch {}

    if (idleRef.current) {
      clearTimeout(idleRef.current)
    }
    idleRef.current = window.setTimeout(() => {
      performLogout()
    }, idleTimeoutMs)
  }, [idleTimeoutMs, performLogout])

  useEffect(() => {
    try {
      const last = localStorage.getItem(ADMIN_LAST_ACTIVE_KEY)
      if (
        last &&
        idleTimeoutMs &&
        Date.now() - Number(last) > idleTimeoutMs
      ) {
        performLogout()
        return
      }
    } catch {}
    
    // BroadcastChannel for multi-tab logout sync
    if (typeof BroadcastChannel !== "undefined") {
      bcRef.current = new BroadcastChannel("admin-auth")
      bcRef.current.onmessage = (ev) => {
        if (ev.data?.type === "admin-logout") {
          performLogout(false)
        }
      }
    } else {
      const handler = () => performLogout(false)
      window.addEventListener("storage", (ev) => {
        if (ev.key === "admin-logout") handler()
      })
    }

    // call once on mount
    handleRefreshResponse()

    // schedule periodic refresh
    timerRef.current = window.setInterval(() => {
      handleRefreshResponse()
    }, intervalMs)

    // idle listeners
    const events = ["mousemove", "keydown", "scroll", "touchstart"]
    if (idleTimeoutMs) {
      events.forEach((ev) => window.addEventListener(ev, resetIdle))
      resetIdle()
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (idleRef.current) clearTimeout(idleRef.current)
      if (bcRef.current) bcRef.current.close()
      if (idleTimeoutMs) events.forEach((ev) => window.removeEventListener(ev, resetIdle))
    }
  }, [handleRefreshResponse, intervalMs, idleTimeoutMs, resetIdle, performLogout])

  // expose manual controls
  const refresh = useCallback(async () => {
    await handleRefreshResponse()
  }, [handleRefreshResponse])

  const logout = useCallback(() => {
    performLogout()
  }, [performLogout])

  return { refresh, logout }
}

export default useAdminSessionRefresh