import { Package, ShoppingCart, DollarSign, AlertCircle, Star, MessageSquare } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    totalProducts: number
    totalOrders: number
    pendingOrders: number
    totalRevenue: number
    pendingReviews: number
    newContacts: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: "bg-orange-500",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-500",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews,
      icon: Star,
      color: "bg-yellow-500",
    },
    {
      title: "New Contacts",
      value: stats.newContacts,
      icon: MessageSquare,
      color: "bg-pink-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.title} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
