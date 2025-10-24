import { useQuery } from '@tanstack/react-query'
import { getDefaultTestAgents } from '@/lib/default-test-agents'
import type { Agent } from '@/types/agent'

/**
 * Hook to fetch and cache available judges
 */
export function useJudges() {
  return useQuery({
    queryKey: ['judges'],
    queryFn: async () => {
      // In production, this would be an API call
      // For now, return default test agents
      return getDefaultTestAgents()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get a specific judge by ID
 */
export function useJudge(id: string) {
  return useQuery({
    queryKey: ['judge', id],
    queryFn: async () => {
      const agents = getDefaultTestAgents()
      return agents.find(agent => agent.id === id)
    },
    enabled: !!id,
  })
}
