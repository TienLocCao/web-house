"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { AppImage } from "./ui/app-image"

export function WhyUsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = sectionRef.current?.querySelectorAll(".observe-animate")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 observe-animate opacity-0">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold">Why Choosing Us</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Lorem Ipsum Dolor Sit Amet Consectetur. Molestie Sed Nisi Sapis Vitae Fringilla Fringilla Malesuada
                Tortor Malesuada Ac. Et At Felis Velit Donec. Bibendum Placerat Suspendisse Vel Bibendum Faucibus
                Tincidunt.
              </p>
              <p>
                Nulla Nisl Massa Mattis In Tristique A Oribus Placerat At Elit. Eros Nunc Auctor Fringilla Augue
                Maecenas Blandit Facilisi Blandit Varius Nunc Eget Blandit Pellentesque Blandit Cursus Mollit Augue.
              </p>
              <p>
                A At Consequat Eget Ipsum Nulla Ultrices. Nulla Nisl Massa Mattis In Tristique A Oribus Placerat At Elit
                Lacus Sodales Suspendisse Bibendum In Magna Vitae Elementum Blandit Blandit Cursus Mollit Augue.
              </p>
            </div>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Read More
            </Button>
          </div>

          {/* Right Content - Image */}
          <div className="relative observe-animate opacity-0" style={{ animationDelay: "0.2s" }}>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <AppImage src="/elegant-dining-room-with-wooden-chair.jpg" alt="Dining Room Chair" fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
