import { useState, useCallback } from 'react'

export interface Judge {
  id: number | string
  name: string
  price: number
  avatar: string
  [key: string]: any
}

export function useJudgeSelection(maxJudges: number = 5) {
  const [selectedJudges, setSelectedJudges] = useState<Judge[]>([])

  const selectJudge = useCallback((judge: Judge) => {
    setSelectedJudges(prev => {
      const isSelected = prev.some(j => j.id === judge.id)
      if (isSelected) {
        return prev.filter(j => j.id !== judge.id)
      } else if (prev.length < maxJudges) {
        return [...prev, judge]
      }
      return prev
    })
  }, [maxJudges])

  const removeJudge = useCallback((judgeId: number | string) => {
    setSelectedJudges(prev => prev.filter(j => j.id !== judgeId))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedJudges([])
  }, [])

  const isSelected = useCallback((judgeId: number | string) => {
    return selectedJudges.some(j => j.id === judgeId)
  }, [selectedJudges])

  const totalCost = selectedJudges.reduce((sum, judge) => sum + judge.price, 0)

  return {
    selectedJudges,
    selectJudge,
    removeJudge,
    clearSelection,
    isSelected,
    totalCost,
    isFull: selectedJudges.length >= maxJudges,
  }
}
