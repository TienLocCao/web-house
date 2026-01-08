import type { LucideIcon } from "lucide-react"
import { LayoutDashboard, Package, ShoppingCart, Star, MessageSquare, FolderOpen, Users, Settings } from "lucide-react"
import { usePathname } from "next/navigation"

export type adminNavigationType = {
    name: string
    href: string
    icon: LucideIcon
} 

export const adminNavigation:adminNavigationType[] = [
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

export function useActiveAdminPage() {
  const pathname = usePathname()

  return (
    adminNavigation.find(item => {
      if (item.href === "/admin") {
        return pathname === "/admin"
      }

      return (
        pathname === item.href ||
        pathname.startsWith(item.href + "/")
      )
    }) ?? adminNavigation[0]
  )
}

