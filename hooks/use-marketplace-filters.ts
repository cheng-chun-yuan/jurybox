import { useState, useMemo } from 'react'

export interface FilterableJudge {
  name: string
  title: string
  specialties: string[]
  [key: string]: any
}

export function useMarketplaceFilters<T extends FilterableJudge>(judges: T[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredJudges = useMemo(() => {
    return judges.filter((judge) => {
      const matchesSearch =
        judge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        judge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        judge.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        selectedCategory === 'All' ||
        judge.specialties.some((s) => s.toLowerCase().includes(selectedCategory.toLowerCase()))

      return matchesSearch && matchesCategory
    })
  }, [judges, searchQuery, selectedCategory])

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredJudges,
  }
}
