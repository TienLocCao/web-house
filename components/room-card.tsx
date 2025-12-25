"use client"

import Link from "next/link"
import { AppImage } from "@/components/ui/app-image"
interface RoomCardProps {
  title: string
  description?: string | null
  imageUrl?: string
  href: string
  delay?: string
}

export function RoomCard({ title, description, imageUrl, href, delay }: RoomCardProps) {
  return (
    <Link href={href}>
      <div
        className="group observe-animate hover:scale-[1.02] transition-transform duration-300"
        style={{ animationDelay: delay }}
      >
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-xl transition-shadow">
          <AppImage src={imageUrl} alt={title} fill className="object-cover" />
        </div>
        <h3 className="text-2xl font-serif font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Link>
  )
}
