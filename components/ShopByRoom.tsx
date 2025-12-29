"use client"

import { useRef } from "react"
import { RoomCard } from "@/components/RoomCard"
import { useProducts } from "@/lib/useProducts"
import type { Product } from "@/lib/types/product"
import { useAnimateOnInView } from "@/hooks/useAnimateOnInView"

export function ShopByRoom({ initialProductsByRoom }: { initialProductsByRoom?: { living_room?: Product[]; dining_room?: Product[]; bedroom?: Product[] } }) {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { products: livingRoomProducts } = useProducts({ room_type: "living_room", limit: 1 })
  const { products: diningRoomProducts } = useProducts({ room_type: "dining_room", limit: 1 })
  const { products: bedroomProducts } = useProducts({ room_type: "bedroom", limit: 1 })

  console.log("Living Room Products:", livingRoomProducts)
  useAnimateOnInView(sectionRef, { threshold: 0.1 })

  const rooms = [
    {
      title: livingRoomProducts[0]?.name || "Living Room",
      description: livingRoomProducts[0]?.description,
      imageUrl:
        livingRoomProducts[0]?.image_url || initialProductsByRoom?.living_room?.[0]?.image_url,
      href: "/products?room_type=living_room",
    },
    {
      title: diningRoomProducts[0]?.name || "Dining Room",
      description: diningRoomProducts[0]?.description,
      imageUrl:
        diningRoomProducts[0]?.image_url || initialProductsByRoom?.dining_room?.[0]?.image_url,
      href: "/products?room_type=dining_room",
    },
    {
      title: bedroomProducts[0]?.name || "Bedroom",
      description: bedroomProducts[0]?.description,
      imageUrl:
        bedroomProducts[0]?.image_url || initialProductsByRoom?.bedroom?.[0]?.image_url,
      href: "/products?room_type=bedroom",
    },
  ]
  console.log("Rooms Data:", rooms)

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
