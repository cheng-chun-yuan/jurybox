import { useState, useCallback } from 'react'

export function useSpecialtyManager(initialSpecialties: string[] = []) {
  const [specialties, setSpecialties] = useState<string[]>(initialSpecialties)
  const [specialtyInput, setSpecialtyInput] = useState('')

  const addSpecialty = useCallback(() => {
    if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
      setSpecialties(prev => [...prev, specialtyInput.trim()])
      setSpecialtyInput('')
    }
  }, [specialtyInput, specialties])

  const removeSpecialty = useCallback((specialty: string) => {
    setSpecialties(prev => prev.filter(s => s !== specialty))
  }, [])

  const clearSpecialties = useCallback(() => {
    setSpecialties([])
    setSpecialtyInput('')
  }, [])

  return {
    specialties,
    specialtyInput,
    setSpecialtyInput,
    addSpecialty,
    removeSpecialty,
    clearSpecialties,
  }
}
