"use client"

import { useEffect, useRef } from "react"
import { RoomCard } from "@/components/room-card"
import { useProducts } from "@/lib/use-products"

export function ShopByRoom() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { products: livingRoomProducts } = useProducts({ room_type: "living_room", limit: 1 })
  const { products: diningRoomProducts } = useProducts({ room_type: "dining_room", limit: 1 })
  const { products: bedroomProducts } = useProducts({ room_type: "bedroom", limit: 1 })

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

  const rooms = [
    {
      title: "Living Room",
      description:
        "Create a welcoming space with comfortable sofas, elegant coffee tables, and stylish decor. Perfect for relaxation and entertaining guests.",
      imageUrl: livingRoomProducts[0]?.image_url || "/modern-living-room.png",
      href: "/products?room_type=living_room",
    },
    {
      title: "Dining Room",
      description:
        "Gather around beautiful dining tables with family and friends. Our collection features elegant designs that make every meal special.",
      imageUrl: diningRoomProducts[0]?.image_url || "/elegant-dining-room.png",
      href: "/products?room_type=dining_room",
    },
    {
      title: "Bedroom",
      description:
        "Transform your bedroom into a peaceful retreat with our comfortable beds, stylish nightstands, and cozy bedding collections.",
      imageUrl: bedroomProducts[0]?.image_url || "/cozy-bedroom.png",
      href: "/products?room_type=bedroom",
    },
  ]

  return (
    <section id="categories" ref={sectionRef} className="py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 observe-animate opacity-0">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-4">Shop By Room</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover furniture and decor perfectly curated for every space in your home. From living rooms to bedrooms,
            we have everything you need.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <RoomCard key={room.title} {...room} delay={`${index * 0.1}s`} />
          ))}
        </div>
      </div>
    </section>
  )
}
