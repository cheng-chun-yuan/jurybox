/**
 * Judge Type Definitions
 * Used across the application for judge data from backend API
 */

export interface Judge {
  id: number
  name: string
  title: string
  tagline: string
  rating: number
  reviews: number
  price: number
  specialties: string[]
  color: 'purple' | 'cyan' | 'gold'
  avatar: string
  trending?: boolean
  bio: string
  expertise: string[]
  achievements: string[]
  sampleReviews: Array<{
    rating: number
    comment: string
    author: string
    date: string
  }>
}

export interface JudgesApiResponse {
  success: boolean
  data: Judge[]
}

export interface JudgeApiResponse {
  success: boolean
  data: Judge
}

export interface ApiError {
  success: false
  error: string
  message: string
}
