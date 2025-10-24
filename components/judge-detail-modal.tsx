"use client"

import Image from "next/image"
import { Star, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface JudgeDetailModalProps {
  judge: {
    id: number
    name: string
    title: string
    tagline: string
    rating: number
    reviews: number
    price: number
    specialties: string[]
    color: "purple" | "cyan" | "gold"
    avatar: string
    bio: string
    expertise: string[]
    achievements: string[]
    sampleReviews: Array<{
      rating: number
      comment: string
      author: string
      date: string
    }>
  } | null
  open: boolean
  onClose: () => void
  onSelect?: (judgeId: number) => void
  selected?: boolean
}

export function JudgeDetailModal({ judge, open, onClose, onSelect, selected }: JudgeDetailModalProps) {
  if (!judge) return null

  const colorClasses = {
    purple: "text-brand-purple",
    cyan: "text-brand-cyan",
    gold: "text-brand-gold",
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{judge.name} Details</DialogTitle>
        </DialogHeader>

        {/* Header with Avatar */}
        <div className="flex items-start gap-6 mb-6">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src={judge.avatar || '/placeholder.svg'}
              alt={judge.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-1">{judge.name}</h2>
            <p className={`text-lg mb-2 ${colorClasses[judge.color]}`}>{judge.title}</p>
            <p className="text-foreground/70 italic">"{judge.tagline}"</p>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
                <span className="text-xl font-mono font-bold">{judge.rating}</span>
                <span className="text-sm text-foreground/60">({judge.reviews} reviews)</span>
              </div>
              <div>
                <span className="text-2xl font-mono font-bold text-brand-gold">${judge.price}</span>
                <span className="text-sm text-foreground/60 ml-1">/ judgment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-6">
          {judge.specialties.map((specialty) => (
            <Badge key={specialty} variant="secondary">
              {specialty}
            </Badge>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="expertise">Expertise</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-4">
            <div>
              <h3 className="text-lg font-bold mb-2">Biography</h3>
              <p className="text-foreground/70 leading-relaxed">{judge.bio}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-gold" />
                Achievements
              </h3>
              <ul className="space-y-2">
                {judge.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-brand-purple mt-1">•</span>
                    <span className="text-foreground/70">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="expertise" className="space-y-4">
            <div className="grid gap-3">
              {judge.expertise.map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-surface-2 border border-border/50">
                  <p className="text-foreground/80">{item}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {judge.sampleReviews.map((review, index) => (
              <div key={index} className="p-4 rounded-lg bg-surface-2 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
                      <span className="font-mono font-bold">{review.rating}</span>
                    </div>
                    <span className="text-sm text-foreground/60">by {review.author}</span>
                  </div>
                  <span className="text-xs text-foreground/60">{review.date}</span>
                </div>
                <p className="text-foreground/70">{review.comment}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
          <Button
            className="flex-1 bg-brand-purple hover:bg-brand-purple/90"
            onClick={() => onSelect?.(judge.id)}
            variant={selected ? "outline" : "default"}
          >
            {selected ? "Selected" : "Select Judge"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
