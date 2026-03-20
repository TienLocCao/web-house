"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAnimateOnInView } from "@/hooks/useAnimateOnInView"

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  useAnimateOnInView(sectionRef, { threshold: 0.1 })

  const [current, setCurrent] = useState(0)

  const slides = [
    {
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5sNKdGwVGw_bUq5OoHMvpXwQui-0ckd6ws0bfunTx5dER-9aZmn_c7FTBCQw_qmN41Wqtc-FgAHgHt6l77ELBAptuWWtnTLf4ZGTHXqXqBPGxZ55CJVPA_t2SHyBPoE-CMv98aYujz9hp-5X_-Rjz-QZq6jaZYsa4pC6EevbnJRzW4lhjRJSFIuEZJOZ3lgFRiThUSk7mcfEFOgL1Z4Oec__3KdiBwHDz_zZnFI0NMaJDCPXC3hUYJWlIXdgQ3smQIcyOzXA0wis",
      title: "The Art of",
      italic: "Living Well.",
      label: "Est. 2017 — Boutique Studio",
    },
    {
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcxTw4uIr6MuootI6xSnWJWHJSplDCYxEtJpvoryznExxpb79tGk1YKfSZUZTeLSPYHh1iEzjHQ9SeVxyIA5or7AqeBezjSOBwhMKWnvjkTikWk5oQ-IZ86H3HHe1g4WbYfHsPiUzX5ekWh1Z8BK10UiVR0TiD5pLE6WUsIsEKjwiyVwmdupD_5M7zvUDgJRDkEFkEPY3ZUUsUYWNyQi_1CR_cXqETG3Y10dBFFDSVCKBD3acR6Mdki7-GEV6ak4VnfVV_thR4VJ8",
      title: "Timeless",
      italic: "Aesthetics.",
      label: "Curation & Design",
    },
    {
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAE96WxZIFJJ6o6JBNEvS686pvuNrVCNLxqdOumhBs1X7dQvlNa8z-byrcmnd16fkVFJEixzIy13OGiyATkRlC9WYpDCYPiMotr4J-pCYZuUSqXDVsM73a9f5Zo3p12rMcELSm6az3LnjiJ_22Fp6R2dB4PRCHRBPAWQ6RHLMXkFTrDcUwS6BuDpNXMAJ-vInXrIWVGAjZz_1yjdGOAYznEzlCKzW55QDiyGll3w47TBUZ1FKkBO815Vi3uaxzJk2yA4Xj07eHzZzs",
      title: "Bespoke",
      italic: "Interiors.",
      label: "Refined Luxury",
    },
  ]

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [])


  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* BACKGROUND SLIDER */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-all duration-1000 ${
            i === current
              ? "opacity-100 scale-100 z-10"
              : "opacity-0 scale-105 z-0"
          }`}
        >
          <img
            src={slide.img}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />

          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>

          <div className="relative z-20 px-8 md:px-24 h-full flex flex-col justify-center text-white">
            <div className="container mx-auto px-4 lg:px-8">
              <p className="uppercase tracking-[0.4em] mb-6 text-[10px]">
                {slide.label}
              </p>

              <h1 className="text-5xl md:text-8xl leading-[1.1] mb-10">
                {slide.title} <br />
                <span className="italic font-normal">{slide.italic}</span>
              </h1>
            </div>
          </div>
        </div>
      ))}


      {/* DOTS */}
      <div className="absolute container left-1/2 -translate-x-1/2 px-4 lg:px-8 bottom-10 z-30 flex gap-3">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-[2px] w-10 cursor-pointer transition-all ${
              i === current ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </section>
  )
}