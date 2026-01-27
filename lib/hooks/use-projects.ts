"use client"

import useSWR from "swr"
import type { Project } from "@/lib/db"

interface ProjectsResponse {
  data: Project[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useProjects(featured?: boolean, limit = 12) {
  const params = new URLSearchParams()

  if (featured) params.append("featured", "true")
  params.append("limit", limit.toString())

  const { data, error, isLoading } = useSWR<ProjectsResponse>(`/api/projects?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 120000, // 2 minutes
  })

  return {
    projects: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
  }
}

export function useProject(slug: string) {
  const { data, error, isLoading } = useSWR<{
    project: Project
  }>(slug ? `/api/projects/${slug}` : null, fetcher, {
    revalidateOnFocus: false,
  })

  return {
    project: data?.project,
    isLoading,
    isError: error,
  }
}
