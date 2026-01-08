"use client"

import { useState } from "react"
import { AdminSidebar } from "./AdminSidebar"
import { AdminHeader } from "./AdminHeader"
import SessionRefresher from "./SessionRefresher"

export default function AdminShell({
  admin,
  children,
}: {
  admin: any
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AdminSidebar
        admin={admin}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader admin={admin} isCollapsed={isCollapsed} />

        {/* Page Content */}
        <main className="flex-1 flex flex-col overflow-y-auto px-6 pt-6 py-2">{children}</main>
        <SessionRefresher />
      </div>
    </div>
    
  )
}
