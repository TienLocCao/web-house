import type { Metadata } from "next"
import { getProjects } from "@/lib/services/projects"
import ProjectsClient from "@/components/admin/projects/client"

export const metadata: Metadata = { title: "Projects | Admin", description: "Manage projects" }
export const dynamic = "force-dynamic"

export default async function AdminProjectsPage() {
  const { items, total } = await getProjects({ page: 1, limit: 10 })
  return <ProjectsClient initialData={items} initialTotal={total} />
}