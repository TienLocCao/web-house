import { Header } from "@/components/layout/Header"
import { HeroSection } from "@/components/home/HeroSection"
import { WhyUsSection } from "@/components/home/WhyUsSection"
import { ShopByRoom } from "@/components/shop/ShopByRoom"
import ProjectsSection from "@/components/home/ProjectsSection"
import { Footer } from "@/components/layout/Footer"

import { getProjects } from "@/lib/services/projects"
import { sql } from "@/lib/db"

export const revalidate = 60

export default async function HomePage() {
  // Fetch small datasets server-side to hydrate client components
  const [projectsResult, productsCountRes, projectsCountRes, reviewsCountRes, ordersCountRes] = await Promise.all([
    getProjects({ limit: 6, filter: {} }),
    sql`SELECT COUNT(*)::int AS count FROM products WHERE is_available = true`,
    sql`SELECT COUNT(*)::int AS count FROM projects WHERE status = 'completed'`,
    sql`SELECT COUNT(*)::int AS count FROM reviews WHERE is_approved = true`,
    sql`SELECT COUNT(*)::int AS count FROM orders`,
  ])

  const initialProjects = projectsResult.items || []

  const stats = {
    total_products: Number(productsCountRes[0]?.count ?? 0),
    completed_projects: Number(projectsCountRes[0]?.count ?? 0),
    customer_reviews: Number(reviewsCountRes[0]?.count ?? 0),
    total_orders: Number(ordersCountRes[0]?.count ?? 0),
    years_experience: 7,
    countries_shipped: 2,
  }

  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection initialStats={stats} />
      <WhyUsSection />
      <ShopByRoom/>
      <ProjectsSection initialProjects={initialProjects} />
      <Footer />
    </main>
  )
}
