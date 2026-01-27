"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useProjects } from "@/lib/hooks"
import { Calendar, MapPin, User } from "lucide-react"
import type { Project } from "@/lib/db"

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group">
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted mb-4">
        <Image
          src={project.image_url || "/placeholder.svg"}
          alt={project.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {project.featured && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="text-xs">
            {project.room_type || "Interior Design"}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {project.client_name && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{project.client_name}</span>
            </div>
          )}
          {project.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{project.location}</span>
            </div>
          )}
        </div>

        {project.completion_date && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Completed {new Date(project.completion_date).getFullYear()}</span>
          </div>
        )}

        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
      </div>
    </Link>
  )
}

function ProjectCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[4/3] rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const { projects, isLoading } = useProjects(false, 12)

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-12 lg:py-20 bg-muted border-b">
        <div className="mx-auto container px-4 lg:px-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold">Our Projects</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore our portfolio of stunning interior design projects, showcasing our expertise in creating beautiful, functional spaces.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto container px-4 lg:px-8">
          <div className="space-y-8">
            <p className="text-muted-foreground">
            Showing {projects.length} projects
            </p>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No projects found</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}