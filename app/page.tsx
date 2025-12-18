import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { WhyUsSection } from "@/components/why-us-section"
import { ShopByRoom } from "@/components/shop-by-room"
import { ProjectsSection } from "@/components/projects-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <WhyUsSection />
      <ShopByRoom />
      <ProjectsSection />
      <Footer />
    </main>
  )
}
