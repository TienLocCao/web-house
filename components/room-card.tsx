"use client"

import Image from "next/image"
import Link from "next/link"

interface RoomCardProps {
  title: string
  description: string
  imageUrl: string
  href: string
  delay?: string
}

export function RoomCard({ title, description, imageUrl, href, delay }: RoomCardProps) {
  return (
    <Link href={href}>
      <div
        className="group observe-animate opacity-0 hover:scale-[1.02] transition-transform duration-300"
        style={{ animationDelay: delay }}
      >
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-xl transition-shadow">
          <Image src={imageUrl || "/placeholder.svg"} alt={title} fill className="object-cover" />
        </div>
        <h3 className="text-2xl font-serif font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Link>
  )
}
