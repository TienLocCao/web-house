"use client"

import Link from "next/link"
import { useRef } from "react"
import { AppImage } from "@/components/ui/app-image"
import { useAnimateOnInView } from "@/hooks/useAnimateOnInView"
interface RoomCardProps {
  title: string
  description?: string | null
  imageUrl?: string
  href: string
  delay?: string
  index: number
}

export function RoomCard({
  title,
  description,
  imageUrl,
  href,
  delay,
  index,
}: RoomCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  useAnimateOnInView(cardRef, { threshold: 0.1 })

  const isReverse = index % 2 !== 0

  return (
    <Link href={href}>
      <div
        ref={cardRef}
        className={`group observe-animate opacity-0 flex flex-col md:flex-row gap-12 items-center
          ${isReverse ? "md:flex-row-reverse md:translate-y-16" : ""}
        `}
        data-animate={`${isReverse ? "animate-fade-in-right" : "animate-fade-in-left"}`}
        data-delay={`${index * 200}`}
        style={{ animationDelay: delay }}
      >
        {/* IMAGE */}
        <div className="relative w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
          <AppImage src={imageUrl} alt={title} fill className="object-cover" />
        </div>

        {/* TEXT */}
        <div className="md:w-1/2">
          <h3 className="text-2xl font-serif font-bold mb-3">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}

