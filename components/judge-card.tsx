"use client"

import { Star, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface JudgeCardProps {
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
    trending?: boolean
  }
  onSelect?: (judgeId: number) => void
  selected?: boolean
}

export function JudgeCard({ judge, onSelect, selected }: JudgeCardProps) {
  const colorClasses = {
    purple: {
      border: "border-brand-purple/30 hover:border-brand-purple",
      glow: "hover:glow-purple-strong",
      bg: "bg-brand-purple hover:bg-brand-purple/90",
      badge: "bg-brand-purple/10 border-brand-purple/30 text-brand-purple",
    },
    cyan: {
      border: "border-brand-cyan/30 hover:border-brand-cyan",
      glow: "hover:glow-cyan",
      bg: "bg-brand-cyan hover:bg-brand-cyan/90",
      badge: "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan",
    },
    gold: {
      border: "border-brand-gold/30 hover:border-brand-gold",
      glow: "hover:glow-gold",
      bg: "bg-brand-gold hover:bg-brand-gold/90",
      badge: "bg-brand-gold/10 border-brand-gold/30 text-brand-gold",
    },
  }

  const colors = colorClasses[judge.color]

  return (
    <div
      className={`group relative rounded-[20px] bg-surface-1 border-2 transition-all duration-300 hover-lift overflow-hidden ${colors.border} ${colors.glow} ${selected ? "ring-2 ring-brand-purple ring-offset-2 ring-offset-background" : ""}`}
    >
      {judge.trending && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-gold/90 backdrop-blur-sm">
          <TrendingUp className="w-3 h-3 text-white" />
          <span className="text-xs font-bold text-white">Trending</span>
        </div>
      )}

      {/* Avatar */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={judge.avatar || `/placeholder.svg?height=200&width=400&query=${judge.name} avatar`}
          alt={judge.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-1 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold mb-1">{judge.name}</h3>
            <p className="text-sm text-brand-cyan">{judge.title}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${colors.badge}`}>
              <Star className={`w-3 h-3 fill-current`} />
              <span className="text-sm font-mono font-bold">{judge.rating}</span>
            </div>
            <span className="text-xs text-foreground/60">{judge.reviews} reviews</span>
          </div>
        </div>

        <p className="text-sm text-foreground/60 mb-4 italic">"{judge.tagline}"</p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {judge.specialties.map((specialty) => (
            <Badge key={specialty} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            <span className="text-2xl font-mono font-bold text-brand-gold">${judge.price}</span>
            <span className="text-sm text-foreground/60 ml-1">/ judgment</span>
          </div>
          <Button
            size="sm"
            className={colors.bg}
            onClick={() => onSelect?.(judge.id)}
            variant={selected ? "outline" : "default"}
          >
            {selected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </div>
  )
}
