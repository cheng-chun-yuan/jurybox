"use client"

import { useState, useEffect } from "react"
import type { Judge, JudgesApiResponse } from "@/types/judge"

/**
 * Hook to fetch judges by IDs from backend API
 * Used in submit page to get selected judges
 */
export function useJudgesByIds(ids: number[]) {
  const [judges, setJudges] = useState<Judge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ids || ids.length === 0) {
      setJudges([])
      setLoading(false)
      return
    }

    const fetchJudges = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/judges/batch?ids=${ids.join(',')}`
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch judges: ${response.statusText}`)
        }

        const data: JudgesApiResponse = await response.json()

        if (data.success) {
          setJudges(data.data)
        } else {
          throw new Error('Failed to fetch judges from API')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        setJudges([])
      } finally {
        setLoading(false)
      }
    }

    fetchJudges()
  }, [ids.join(',')]) // Stringify array for stable dependency

  return { judges, loading, error }
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
  const [judges, setJudges] = useState<Judge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJudges = async () => {
      setLoading(true)
      setError(null)

      try {
        // Build query params
        const params = new URLSearchParams()
        if (options?.specialty) params.append('specialty', options.specialty)
        if (options?.trending) params.append('trending', 'true')
        if (options?.search) params.append('search', options.search)

        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/judges${params.toString() ? `?${params.toString()}` : ''}`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch judges: ${response.statusText}`)
        }

        const data: JudgesApiResponse = await response.json()

        if (data.success) {
          setJudges(data.data)
        } else {
          throw new Error('Failed to fetch judges from API')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        setJudges([])
      } finally {
        setLoading(false)
      }
    }

    fetchJudges()
  }, [options?.specialty, options?.trending, options?.search])

  return { judges, loading, error }
}

/**
 * Hook to fetch a single judge by ID
 * Can be used for judge detail pages
 */
export function useJudgeById(id: number | null) {
  const [judge, setJudge] = useState<Judge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setJudge(null)
      setLoading(false)
      return
    }

    const fetchJudge = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/judges/${id}`
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch judge: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success) {
          setJudge(data.data)
        } else {
          throw new Error('Failed to fetch judge from API')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        setJudge(null)
      } finally {
        setLoading(false)
      }
    }

    fetchJudge()
  }, [id])

  return { judge, loading, error }
}
