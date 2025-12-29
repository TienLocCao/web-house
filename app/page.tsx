import { Header } from "@/components/layout/Header"
import { HeroSection } from "@/components/HeroSection"
import { WhyUsSection } from "@/components/WhyUsSection"
import { ShopByRoom } from "@/components/ShopByRoom"
import { ProjectsSection } from "@/components/ProjectsSection"
import { Footer } from "@/components/layout/Footer"

import { getProducts } from "@/lib/services/products"
import { getProjects } from "@/lib/services/projects"
import { sql } from "@/lib/db"

export default async function HomePage() {
  // Fetch small datasets server-side to hydrate client components
  const [productsResult, projectsResult, productsCountRes, projectsCountRes, reviewsCountRes, ordersCountRes] = await Promise.all([
    getProducts({ limit: 6, filter: { is_available: true } }),
    getProjects({ limit: 6, filter: {} }),
    sql`SELECT COUNT(*)::int AS count FROM products WHERE is_available = true`,
    sql`SELECT COUNT(*)::int AS count FROM projects WHERE status = 'completed'`,
    sql`SELECT COUNT(*)::int AS count FROM reviews WHERE is_approved = true`,
    sql`SELECT COUNT(*)::int AS count FROM orders`,
  ])

  const initialProducts = productsResult.items || []
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
      <ShopByRoom initialProductsByRoom={{
        living_room: initialProducts.filter((p: any) => p.room_type === "living_room"),
        dining_room: initialProducts.filter((p: any) => p.room_type === "dining_room"),
        bedroom: initialProducts.filter((p: any) => p.room_type === "bedroom"),
      }} />
      <ProjectsSection initialProjects={initialProjects} />
      <Footer />
    </main>
  )
}
