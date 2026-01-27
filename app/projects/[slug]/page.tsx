"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useProject } from "@/lib/hooks"
import { Calendar, MapPin, User, DollarSign, Phone, Mail } from "lucide-react"

function ProjectDetailSkeleton() {
  return (
    <section className="pt-32 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Project Detail */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24">
          {/* Images */}
          <div className="space-y-4">
            <Skeleton className="aspect-[4/3] rounded-2xl" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>

          {/* Project Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>

            <Skeleton className="h-24 w-full rounded-lg" />

            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>

            <Skeleton className="h-px w-full" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>

            <Skeleton className="h-px w-full" />

            <div className="space-y-6">
              <div className="flex gap-3">
                <Skeleton className="h-14 flex-1" />
                <Skeleton className="h-14 w-24" />
              </div>

              <div className="space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-24">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ProjectDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const { project, isLoading, isError } = useProject(slug)

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <Header />
        <ProjectDetailSkeleton />
        <Footer />
      </main>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground">The project you're looking for doesn't exist</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Project Detail */}
          <div className="grid lg:grid-cols-2 gap-12 mb-24">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                <Image src={project.image_url || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
                {project.featured && (
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                    Featured Project
                  </Badge>
                )}
              </div>
              {project.gallery && project.gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {project.gallery.slice(0, 4).map((image: string, index: number) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image src={image} alt={`${project.title} ${index + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Info */}
            <div className="space-y-8">
              <div>
                <Badge className="mb-3 text-sm px-3 py-1">
                  {project.room_type || "INTERIOR DESIGN"}
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-4 leading-tight">
                  {project.title}
                </h1>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-muted-foreground">Project ID: {project.id}</span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.client_name && (
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">Client</span>
                        <p className="font-semibold">{project.client_name}</p>
                      </div>
                    </div>
                  )}
                  {project.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">Location</span>
                        <p className="font-semibold">{project.location}</p>
                      </div>
                    </div>
                  )}
                  {project.completion_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">Completed</span>
                        <p className="font-semibold">
                          {new Date(project.completion_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {project.budget && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">Budget</span>
                        <p className="font-semibold">${project.budget.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {project.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Project Description</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {project.description}
                  </p>
                </div>
              )}

              <Separator />

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground font-medium mb-1">Status</span>
                  <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className="w-fit">
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground font-medium mb-1">Room Type</span>
                  <span className="font-semibold">{project.room_type || 'Various'}</span>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="flex-1 text-lg py-6">
                    <Phone className="mr-2 h-5 w-5" />
                    Get Similar Project
                  </Button>
                  <Button variant="outline" size="lg" className="sm:w-auto px-6">
                    <Mail className="mr-2 h-5 w-5" />
                    Contact Us
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>✓ Professional interior design consultation</p>
                  <p>✓ Custom project planning and execution</p>
                  <p>✓ Quality craftsmanship guaranteed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <div className="mb-24">
              <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-8">Project Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.gallery.map((image: string, index: number) => (
                  <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={image}
                      alt={`${project.title} gallery ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}