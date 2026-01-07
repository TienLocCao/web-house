"use client"

import { useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { StatsDisplay } from "@/components/admin/dashboard/starts/StatsDisplay"
import type { Stats } from "@/lib/types/stats"
import { AppImage } from "@/components/ui/app-image"
import { useAnimateOnInView } from "@/hooks/useAnimateOnInView"
type HeroSectionProps = {
  initialStats: Stats
}

export function HeroSection({ initialStats }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  useAnimateOnInView(sectionRef, { threshold: 0.1 })

  return (
    <section id="home" ref={sectionRef} className="pt-32 pb-16 lg:pt-40 lg:pb-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-serif font-bold text-balance leading-tight observe-animate"   data-animate="animate-rotate-in-up"
  data-delay="200">HOUSE OF COMFORT</h1>
              <p className="text-lg text-muted-foreground max-w-md observe-animate animate-text-base" data-animate="animate-fade-in-up" data-delay="400">
                Premium pieces designed to elevate your home with timeless elegance.
              </p>
            </div>

            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 observe-animate " data-animate="animate-scale-in" data-delay="650">
              Read More
            </Button>

            {/* Statistics Grid */}
            <div className="pt-8 observe-animate"  data-animate="animate-fade-in-up" data-delay="900">
              <StatsDisplay initialStats={initialStats} />
            </div>
          </div>

          {/* Right Content - Featured Product */}
          <div className="relative observe-animate opacity-0" data-animate="animate-fade-in-right" data-delay="500">
            <div className="relative aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
              <AppImage
                src="/uploads/home/modern-black-chair-with-wooden-legs.jpg"
                alt="Modern Black Chair"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Floating Cards */}
            <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-lg max-w-[200px]">
              <AppImage
                src="/uploads/home/cozy-living-room.png"
                alt="Room Preview"
                width={200}
                height={120}
                className="rounded-lg mb-2"
              />
            </div>

            <div className="absolute bottom-8 right-8 bg-card/95 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold">150+</div>
              <div className="text-sm text-muted-foreground">Classic Themes for</div>
              <div className="text-sm text-muted-foreground">Furniture in Showcasing</div>
              <div className="flex -space-x-2 mt-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-card" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
