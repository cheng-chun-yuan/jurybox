"use client"

import Image from "next/image"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
          <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
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

        {/* Content */}
        <div className="space-y-4">
          {/* About Section */}
          <div className="p-4 rounded-lg bg-surface-1 border border-border/50">
            <h3 className="text-lg font-bold mb-3 text-brand-purple">About</h3>
            <p className="text-foreground/80 leading-relaxed text-sm">{judge.bio}</p>
          </div>

          {/* Expertise Section */}
          <div className="p-4 rounded-lg bg-surface-1 border border-border/50">
            <h3 className="text-lg font-bold mb-3 text-brand-cyan">Areas of Expertise</h3>
            <div className="grid gap-2">
              {judge.expertise.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full shrink-0"></div>
                  <span className="text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          {/* <div className="p-4 rounded-lg bg-surface-1 border border-border/50">
            <h3 className="text-lg font-bold mb-3 text-brand-gold">Recent Reviews</h3>
            <div className="space-y-3">
              {judge.sampleReviews.slice(0, 3).map((review, index) => (
                <div key={index} className="border-l-2 border-brand-gold/30 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
                      <span className="font-mono font-bold text-sm">{review.rating}</span>
                    </div>
                    <span className="text-xs text-foreground/60">by {review.author}</span>
                  </div>
                  <p className="text-foreground/70 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div> */}
        </div>

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
