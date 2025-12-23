import type React from "react"
import { validateSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminShell from "@/components/admin/admin-shell"
import "./globals.css"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Require authentication for all admin routes
  const admin = await validateSession()

  if (!admin) {
    redirect("/admin/login")
  }

  return (
    <AdminShell admin={admin}>{children}</AdminShell>
  )
}
