import type { Project } from "@/lib/types/project"
import { getProjects } from "@/lib/services/projects"
import ProjectsCarousel from "./projects-carousel"

export default async function ProjectsSection({ initialProjects }: { initialProjects?: Project[] }) {
  const data = initialProjects && initialProjects.length ? initialProjects : (await getProjects({ limit: 6 })).items

  const projects: Project[] = Array.isArray(data) ? data : []

  return (
    <section id="top-selling" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-4">Explore Our Projects</h2>
          <p className="text-muted-foreground max-w-2xl">
            Here are some of our latest projects. We have completed numerous transformations continuously, showcasing
            diverse styles and creative solutions.
          </p>
        </div>

        <ProjectsCarousel initialProjects={projects} />
      </div>
    </section>
  )
}
