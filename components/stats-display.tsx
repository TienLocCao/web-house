"use client"

import { useEffect, useState } from "react"
import { StatCard } from "@/components/stat-card"
import type { Stats } from "@/lib/types/stats"

export function StatsDisplay({ initialStats }: { initialStats?: Stats | null }) {
  const [stats, setStats] = useState<Stats | null>(initialStats ?? null)
  const [isLoading, setIsLoading] = useState(!initialStats)

  useEffect(() => {
    if (initialStats) {
      setIsLoading(false)
      return
    }

    async function fetchStats() {
      try {
        const response = await fetch("/api/stats")
        const data = await response.json()
        setStats(data.data)
      } catch (error) {
        console.error("[v0] Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [initialStats])

  if (isLoading) {
    return null
  }

  if (!stats) {
    // Fallback to default stats
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        <StatCard number={7} label="Year Experience" delay="0s" />
        <StatCard number={2} label="Opened in the country" delay="0.1s" />
        <StatCard number={10} label="Furniture sold" suffix="k+" delay="0.2s" />
        <StatCard number={260} label="Variant Furniture" suffix="+" delay="0.3s" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
      <StatCard number={stats.years_experience} label="Years Experience" delay="0s" />
      <StatCard number={stats.completed_projects} label="Completed Projects" delay="0.1s" />
      <StatCard number={stats.total_products} label="Furniture Available" suffix="+" delay="0.2s" />
      <StatCard number={stats.customer_reviews} label="Happy Customers" suffix="+" delay="0.3s" />
    </div>
  )
}
