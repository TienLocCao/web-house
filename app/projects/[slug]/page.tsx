"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useProject } from "@/lib/hooks"
import { Calendar, MapPin, User, DollarSign, Phone, Mail } from "lucide-react"
import { ProjectDetailSkeleton } from "@/components/project/Skeleton"

export default function ProjectDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const { project, isLoading } = useProject(slug)

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
        <p className="text-muted-foreground">Project not found</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-14 lg:pt-32 lg:pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-20 lg:mb-24">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                <Image
                  src={project.image_url || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
                {project.featured && (
                  <Badge className="absolute top-4 right-4">
                    Featured
                  </Badge>
                )}
              </div>

              {project.gallery?.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {project.gallery.slice(0, 4).map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image src={img} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6 lg:space-y-8">
              <div>
                <Badge className="mb-2 text-sm px-3 py-1">
                  {project.room_type || "INTERIOR DESIGN"}
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-3">
                  {project.title}
                </h1>
                <span className="text-muted-foreground">
                  Project ID: {project.id}
                </span>
              </div>

              <div className="bg-muted/50 rounded-lg p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.client_name && (
                    <Info icon={User} label="Client" value={project.client_name} />
                  )}
                  {project.location && (
                    <Info icon={MapPin} label="Location" value={project.location} />
                  )}
                  {project.completion_date && (
                    <Info
                      icon={Calendar}
                      label="Completed"
                      value={new Date(project.completion_date).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    />
                  )}
                  {project.budget && (
                    <Info
                      icon={DollarSign}
                      label="Budget"
                      value={`$${project.budget.toLocaleString()}`}
                    />
                  )}
                </div>
              </div>

              {project.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Project Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}

              <div className="my-4">
                <Separator />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className="ml-2 mt-1 w-fit">
                    {project.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Room Type</span>
                  <p className="font-semibold">{project.room_type}</p>
                </div>
              </div>

              <div className="my-4">
                <Separator />
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="flex-1 py-5">
                    <Phone className="mr-2 h-5 w-5" />
                    Get Similar Project
                  </Button>
                  <Button variant="outline" size="lg" className="px-6">
                    <Mail className="mr-2 h-5 w-5" />
                    Contact Us
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>✓ Professional consultation</p>
                  <p>✓ Custom planning</p>
                  <p>✓ Quality guaranteed</p>
                </div>
              </div>
            </div>
          </div>

          {project.gallery?.length > 0 && (
            <div className="mb-20 lg:mb-24">
              <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-6">
                Project Gallery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.gallery.map((img, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                    <Image src={img} alt="" fill className="object-cover" />
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

/* =======================
   Helper
======================= */
function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: any
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div>
        <span className="text-sm text-muted-foreground">{label}</span>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  )
}
