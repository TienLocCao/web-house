"use client"

import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"

export default function AdminShell({
  admin,
  children,
}: {
  admin: any
  children: React.ReactNode
}) {
  const [activePage, setActivePage] = useState("dashboard")
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    // <div className="min-h-screen bg-neutral-50">
    //   <AdminSidebar
    //     admin={admin}
    //     activePage={activePage}
    //     setActivePage={setActivePage}
    //     isCollapsed={isCollapsed}
    //     setIsCollapsed={setIsCollapsed}
    //   />

    //   <div className="lg:pl-64">
    //     <AdminHeader admin={admin} isCollapsed={isCollapsed} />
    //     <main className="p-6">{children}</main>
    //   </div>
    // </div>
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AdminSidebar
        admin={admin}
        activePage={activePage}
        setActivePage={setActivePage}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader admin={admin} isCollapsed={isCollapsed} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
    
  )
}
