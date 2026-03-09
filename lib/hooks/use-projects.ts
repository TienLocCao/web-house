"use client"

import useSWR from "swr"
import useSWRInfinite from "swr/infinite"
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
  const getKey = (pageIndex: number, previousPageData: ProjectsResponse | null) => {
    if (previousPageData && !previousPageData.pagination.hasMore) return null

    const params = new URLSearchParams()
    if (featured) params.append("featured", "true")
    params.append("limit", limit.toString())
    
    // Sử dụng offset cho pagination
    if (pageIndex > 0) {
      params.append("offset", (pageIndex * limit).toString())
    }

    return `/api/projects?${params.toString()}`
  }

  const { data, error, isLoading, size, setSize, isValidating } = 
    useSWRInfinite<ProjectsResponse>(getKey, fetcher, {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    })

  // Flatten arrays of pages
  const projects = data ? data.flatMap(page => page.data || []) : []
  
  const isEmpty = data?.[0]?.data?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.pagination?.hasMore === false)

  return {
    projects,
    isLoading,
    isValidating,
    hasMore: !isReachingEnd,
    loadMore: () => setSize(size + 1),
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
