/**
 * Pure API layer for projects
 */

import { secureFetchJSON } from "@/lib/utils"

export type ProjectResponse = {
  success: boolean
  message?: string
  error?: string
}

export const deleteProject = async (id: number): Promise<ProjectResponse> => {
  return secureFetchJSON<ProjectResponse>(`/api/admin/projects/${id}`, {
    method: "DELETE",
  })
}

export const bulkDeleteProjects = async (ids: number[]): Promise<ProjectResponse> => {
  return secureFetchJSON<ProjectResponse>(`/api/admin/projects/bulk-delete`, {
    method: "POST",
    body: JSON.stringify({ ids }),
  })
}
