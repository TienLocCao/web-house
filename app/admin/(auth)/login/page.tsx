import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/LoginForm"
import { validateSessionForLogin } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Admin Login | Laroa Studio",
  description: "Login to admin dashboard",
}

export default async function AdminLoginPage() {
  // Redirect if already logged in
  const session  = await validateSessionForLogin()
  if (session) {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Laroa Studio</h1>
          <p className="text-neutral-600">Admin Dashboard</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Sign In</h2>
          <LoginForm />
        </div>

        <p className="text-center text-sm text-neutral-600 mt-4">Protected area. Authorized personnel only.</p>
      </div>
    </div>
  )
}
