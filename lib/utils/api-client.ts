interface APIError {
  error: string
  details?: unknown
}

class APIClient {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private async handleUnauthorized(): Promise<void> {
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

  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle 401 Unauthorized - trigger automatic logout
    if (response.status === 401) {
      await this.handleUnauthorized()
      throw new Error("Session expired. Redirecting to login...")
    }

    if (!response.ok) {
      const error: APIError = await response.json().catch(() => ({
        error: "An unexpected error occurred",
      }))
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return this.handleResponse<T>(response)
  }
}

export const apiClient = new APIClient()
