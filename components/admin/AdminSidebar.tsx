"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { AdminUser } from "@/lib/auth"
import { LayoutDashboard, Package, ShoppingCart, Star, MessageSquare, FolderOpen, Users, Settings, Menu } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
interface AdminSidebarProps {
  admin: AdminUser
  activePage: string
  setActivePage: (page: string) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Categories", href: "/admin/categories", icon: Package },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Projects", href: "/admin/projects", icon: FolderOpen },
  { name: "Contacts", href: "/admin/contacts", icon: MessageSquare },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin"
  }
  return pathname === href || pathname.startsWith(href + "/")
}

export function AdminSidebar({ admin, activePage, setActivePage, isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "border-r border-sidebar-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-[100px] items-center justify-center border-b border-sidebar-border px-4">
          {isCollapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">Admin Panel</h1>
                <p className="text-xs text-sidebar-foreground/60">Management System</p>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <div className="border-b border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-10 w-full text-white hover:bg-primary/20 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <TooltipProvider delayDuration={0}>
          <nav className="flex-1 space-y-1 p-4">
            
            {navigation.map((item) => {
              const Icon = item.icon
                const isActive = isActivePath(pathname, item.href)

                const menuButton =  (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed && "justify-center px-2",
                  )}
                >
                      <Icon className="w-5 h-5" />
                      {!isCollapsed && <span className="font-medium"><span>{item.name}</span></span>}
                    </Link>
                  </li>
                )
                if (isCollapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                )
              }
                return menuButton
            })}
          </nav>
        </TooltipProvider>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="rounded-lg bg-sidebar-accent p-3">
              <p className="text-xs font-medium text-sidebar-accent-foreground">Need help?</p>
              <p className="mt-1 text-xs text-sidebar-accent-foreground/60">Check our documentation</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
