"use client"

import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import type { AdminUser } from "@/lib/auth"
import { Search, Bell, ChevronDown, Settings, LogOut, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
interface AdminHeaderProps {
  admin: AdminUser
  isCollapsed: boolean
}


export function AdminHeader({ admin, isCollapsed }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" })
      router.push("/admin/login")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    // <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
    //   <div className="flex items-center gap-4">
    //     <Button variant="ghost" size="icon" className="lg:hidden">
    //       <Menu className="w-5 h-5" />
    //     </Button>
    //   </div>

    //   <div className="flex items-center gap-4">
    //     <span className="text-sm text-neutral-600 hidden sm:inline">Welcome, {admin.name}</span>
    //     <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
    //       <LogOut className="w-4 h-4" />
    //       <span className="hidden sm:inline">Logout</span>
    //     </Button>
    //   </div>
    // </header>

    <header className="flex h-[100px] items-center justify-between border-b border-border bg-card px-6 shadow-sm">
      {/* Search Bar */}
      <div className="flex flex-1 items-center gap-4">
        <div className={cn("relative w-full", isCollapsed ? "max-w-2xl" : "max-w-xl")}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="Search anything..." className="h-11 pl-10 pr-4" />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-11 w-11">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <p className="text-sm font-medium">New user registered</p>
              <p className="text-xs text-muted-foreground">John Doe just created an account</p>
              <p className="text-xs text-muted-foreground">2 minutes ago</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <p className="text-sm font-medium">Server update completed</p>
              <p className="text-xs text-muted-foreground">All systems are running smoothly</p>
              <p className="text-xs text-muted-foreground">1 hour ago</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <p className="text-sm font-medium">Payment received</p>
              <p className="text-xs text-muted-foreground">$599.00 from customer #1234</p>
              <p className="text-xs text-muted-foreground">3 hours ago</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-11 gap-3 px-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/professional-avatar.png" alt="Admin" />
                <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium">Admin User</span>
                <span className="text-xs text-muted-foreground">{admin.name}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Edit Information</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
