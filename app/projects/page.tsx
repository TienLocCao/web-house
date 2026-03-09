"use client"

import { useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Badge } from "@/components/ui/badge"
import { useProjects } from "@/lib/hooks"
import { Calendar, MapPin, User, ChevronRight } from "lucide-react"
import type { Project } from "@/lib/db"
import { ProjectCardSkeleton } from "@/components/project/CardSkeleton"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 animate-fade-in-up">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={project.image_url || "/placeholder.svg"}
          alt={project.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {project.featured && (
          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground shadow-md backdrop-blur-sm border-none">
            Featured
          </Badge>
        )}
        <div className="absolute bottom-4 left-4 z-10 transition-transform duration-300 group-hover:-translate-y-1">
          <Badge variant="secondary" className="text-xs font-medium tracking-wide bg-background/90 backdrop-blur-md text-foreground border-none shadow-sm px-3 py-1">
            {project.room_type || "Interior Design"}
          </Badge>
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col flex-grow relative">
        <h3 className="font-serif font-bold text-xl md:text-2xl line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-3">
          {project.title}
        </h3>

        {project.description && (
          <p className="text-sm md:text-base text-muted-foreground line-clamp-2 mb-6 flex-grow leading-relaxed">
            {project.description}
          </p>
        )}

        <div className="mt-auto grid grid-cols-2 gap-y-3 gap-x-4 pt-4 border-t border-border/60 text-xs md:text-sm text-muted-foreground font-medium">
          {project.client_name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 shrink-0 text-primary/70" />
              <span className="truncate">{project.client_name}</span>
            </div>
          )}
          {project.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
              <span className="truncate">{project.location}</span>
            </div>
          )}
          {project.completion_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
              <span>{new Date(project.completion_date).getFullYear()}</span>
            </div>
          )}
          
          <div className="flex items-center justify-end gap-1 col-span-2 md:col-span-1 md:col-start-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 font-semibold justify-self-end mt-2 md:mt-0">
            View Details <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ProjectsPage() {
  // useProjects returned hasMore, loadMore, isValidating based on SWRInfinite update
  const { projects, isLoading, hasMore, loadMore, isValidating } = useProjects(false, 12)

  // Handle safe infinite loading
  const loadMoreSafe = useCallback(() => {
    if (!hasMore || isValidating) return
    loadMore()
  }, [hasMore, isValidating, loadMore])

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasMore),
    onLoadMore: loadMoreSafe,
  })

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden border-b bg-muted/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10 animate-fade-in-up">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold tracking-tight text-foreground">
              Our Projects
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Explore our portfolio of stunning interior design projects, showcasing our expertise in creating beautiful, functional spaces.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="flex-1 py-4 lg:py-6">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-12 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            
            {isLoading && projects.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </div>
            ) : projects.length > 0 ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b">
                  <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                    Showing <span className="font-bold text-foreground mx-1">{projects.length}</span> curated projects
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
                  {projects.map((project, idx) => (
                    <div key={project.id} className="h-full" style={{ animationDelay: `${(idx % 3) * 0.15 + 0.1}s` }}>
                      <ProjectCard project={project} />
                    </div>
                  ))}
                </div>
                
                {/* Infinite Scroll Trigger Ref */}
                {hasMore && (
                  <div ref={loadMoreRef} className="w-full flex justify-center py-10">
                    {isValidating ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
                        <p className="text-sm text-muted-foreground">Loading more...</p>
                      </div>
                    ) : (
                      <div className="h-10 opacity-0">Scroll detector</div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed rounded-3xl bg-muted/5">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-2xl font-serif font-semibold mb-3">No projects yet</h3>
                <p className="text-muted-foreground max-w-md text-lg">
                  We are currently updating our portfolio. Please check back later for exciting new projects.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

