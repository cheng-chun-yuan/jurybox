"use client"

import { useQuery } from "@tanstack/react-query"
import type { Judge, JudgesApiResponse } from "@/types/judge"

/**
 * Hook to fetch judges by IDs from backend API
 * Used in submit page to get selected judges
 */
export function useJudgesByIds(ids: number[]) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['judges', 'batch', ids.join(',')],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/judges/batch?ids=${ids.join(',')}`
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch judges: ${response.statusText}`)
      }

      const result: JudgesApiResponse = await response.json()

      if (!result.success) {
        throw new Error('Failed to fetch judges from API')
      }

      return result.data
    },
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    judges: data || [],
    loading: isLoading,
    error: error?.message || null
  }
}

/**
 * Hook to fetch all judges from backend API
 * Used in marketplace page
 */
export function useAllJudges(options?: {
  specialty?: string
  trending?: boolean
  search?: string
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['judges', 'all', options],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams()
      if (options?.specialty) params.append('specialty', options.specialty)
      if (options?.trending) params.append('trending', 'true')
      if (options?.search) params.append('search', options.search)

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/judges${params.toString() ? `?${params.toString()}` : ''}`

      const response = await fetch(url)
      console.log('response', response)
      if (!response.ok) {
        throw new Error(`Failed to fetch judges: ${response.statusText}`)
      }

      const result: JudgesApiResponse = await response.json()

      if (!result.success) {
        throw new Error('Failed to fetch judges from API')
      }

      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    judges: data || [],
    loading: isLoading,
    error: error?.message || null
  }
}

/**
 * Hook to fetch a single judge by ID
 * Can be used for judge detail pages
 */
export function useJudgeById(id: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['judges', id],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/judges/${id}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch judge: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error('Failed to fetch judge from API')
      }

      return result.data as Judge
    },
    enabled: id !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    judge: data || null,
    loading: isLoading,
    error: error?.message || null
  }
}
