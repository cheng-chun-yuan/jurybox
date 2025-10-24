import { useState, useEffect } from 'react'

export interface AgentFormData {
  name: string
  title: string
  tagline: string
  bio: string
  image: string
  color: 'purple' | 'cyan' | 'gold'
  pricePerJudgment: number
  modelProvider: 'openai' | 'anthropic' | 'groq' | 'ollama'
  modelName: string
  systemPrompt: string
  temperature: number
}

export function useAgentForm(initialData?: Partial<AgentFormData>) {
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    title: '',
    tagline: '',
    bio: '',
    image: '',
    color: 'purple',
    pricePerJudgment: 25,
    modelProvider: 'openai',
    modelName: 'gpt-4',
    systemPrompt: '',
    temperature: 0.7,
    ...initialData,
  })

  const [imagePreviewUrl, setImagePreviewUrl] = useState('')

  // Debounce image preview updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.image && (formData.image.startsWith('http://') || formData.image.startsWith('https://'))) {
        setImagePreviewUrl(formData.image)
      } else if (!formData.image) {
        setImagePreviewUrl('')
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [formData.image])

  const updateField = <K extends keyof AgentFormData>(field: K, value: AgentFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateFormData = (updates: Partial<AgentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      tagline: '',
      bio: '',
      image: '',
      color: 'purple',
      pricePerJudgment: 25,
      modelProvider: 'openai',
      modelName: 'gpt-4',
      systemPrompt: '',
      temperature: 0.7,
    })
    setImagePreviewUrl('')
  }

  return {
    formData,
    imagePreviewUrl,
    setImagePreviewUrl,
    updateField,
    updateFormData,
    resetForm,
  }
}
