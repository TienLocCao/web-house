/**
 * Secure fetch wrapper that automatically handles 401 Unauthorized responses
 * by logging out the user and redirecting to login page
 */

interface FetchOptions extends RequestInit {
  credentials?: RequestCredentials
}

async function handleUnauthorized(): Promise<void> {
  try {
    // Call logout endpoint to clear server-side session
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" })
  } catch (e) {
    // Ignore network errors
  }

  try {
    // Clear client-side storage
    localStorage.removeItem("admin-last-active")
  } catch {}

  // Trigger logout redirect
  if (typeof window !== "undefined") {
    window.location.href = "/admin/login"
  }
}

/**
 * Fetch with automatic 401 logout handling
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise<Response>
 * @throws Will redirect to login on 401
 */
export async function secureFetch(url: string, options?: FetchOptions): Promise<Response> {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
  })

  // Handle 401 Unauthorized
  if (response.status === 401) {
    await handleUnauthorized()
    throw new Error("Session expired. Redirecting to login...")
  }

  return response
}

/**
 * Helper to make a secured fetch call and parse JSON response
 */
export async function secureFetchJSON<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await secureFetch(url, options)

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "An unexpected error occurred",
    }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}
