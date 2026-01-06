import type { Metadata } from "next"
import { sql } from "@/lib/db"
import { DashboardStats } from "@/components/admin/dashboard/DashboardStats"
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders"
import { RecentReviews } from "@/components/admin/dashboard/RecentReviews"

export const metadata: Metadata = {
  title: "Dashboard | Admin",
  description: "Admin dashboard overview",
}

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  // Fetch dashboard statistics
  const [stats] = await Promise.all([
    Promise.all([
      sql`SELECT COUNT(*) as count FROM products`,
      sql`SELECT COUNT(*) as count FROM orders`,
      sql`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`,
      sql
        `SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status IN ('processing', 'shipped', 'delivered')`,
      sql`SELECT COUNT(*) as count FROM reviews WHERE is_approved = false`,
      sql`SELECT COUNT(*) as count FROM contact_inquiries WHERE status = 'new'`,
    ]),
  ])

  const [productsCount, ordersCount, pendingOrdersCount, totalRevenue, pendingReviewsCount, newContactsCount] = stats

  const dashboardStats = {
    totalProducts: Number(productsCount[0].count),
    totalOrders: Number(ordersCount[0].count),
    pendingOrders: Number(pendingOrdersCount[0].count),
    totalRevenue: Number(totalRevenue[0].total),
    pendingReviews: Number(pendingReviewsCount[0].count),
    newContacts: Number(newContactsCount[0].count),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">Welcome to your admin dashboard</p>
      </div>

      <DashboardStats stats={dashboardStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <RecentReviews />
      </div>
    </div>
  )
}
