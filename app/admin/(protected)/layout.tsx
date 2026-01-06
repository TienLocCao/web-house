import type React from "react"
import { requireAuth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminShell from "@/components/admin/AdminShell"
import "./globals.css"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let admin

  try {
    admin = await requireAuth()
  } catch {
    redirect("/admin/login")
  }

  return (
    <AdminShell admin={admin}>
      {children}
    </AdminShell>
  )
}
