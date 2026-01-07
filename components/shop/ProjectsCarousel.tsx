"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Project } from "@/lib/types/project"
import { AppImage } from "@/components/ui/app-image"

type Props = {
  initialProjects: Project[]
}

export default function ProjectsCarousel({ initialProjects }: Props) {
  if (!initialProjects?.length) {
    return <p className="text-center text-muted-foreground">No projects found.</p>
  }

  return (
    <div className="relative group">
      {/* Navigation buttons */}
      <button
        className="swiper-prev absolute left-3 top-1/2 z-10 -translate-y-1/2 
        opacity-0 group-hover:opacity-100 transition bg-white/80 backdrop-blur 
        rounded-full p-2 shadow"
      >
        <ChevronLeft />
      </button>

      <button
        className="swiper-next absolute right-3 top-1/2 z-10 -translate-y-1/2 
        opacity-0 group-hover:opacity-100 transition bg-white/80 backdrop-blur 
        rounded-full p-2 shadow"
      >
        <ChevronRight />
      </button>

      <Swiper
        modules={[Navigation, Autoplay]}
        loop
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{
          nextEl: ".swiper-next",
          prevEl: ".swiper-prev",
        }}
        spaceBetween={24}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
      >
        {initialProjects.map((project) => (
          <SwiperSlide key={project.id}>
            <article className="relative overflow-hidden rounded-2xl shadow-md group/card">
              {/* Image */}
              <div className="relative aspect-[4/3]">
                <AppImage
                  src={project.image_url}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 p-5 text-white space-y-2">
                <h3 className="text-lg font-semibold leading-tight">
                  {project.title}
                </h3>

                {project.location && (
                  <p className="text-xs opacity-80">📍 {project.location}</p>
                )}

                {project.description && (
                  <p className="text-sm opacity-90 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
