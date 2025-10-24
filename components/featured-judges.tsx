"use client"

import Image from "next/image"
import { memo } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const judges = [
  {
    id: 1,
    name: "Dr. Academic",
    title: "Research Specialist",
    tagline: "Rigorous analysis meets clarity",
    rating: 9.8,
    price: 25,
    specialties: ["Research", "Academic", "Analysis"],
    color: "purple",
    avatar: "/judges/professional-academic-avatar.jpg",
  },
  {
    id: 2,
    name: "Creative Maven",
    title: "Design Critic",
    tagline: "Where art meets innovation",
    rating: 9.5,
    price: 30,
    specialties: ["Design", "Creative", "UX"],
    color: "cyan",
    avatar: "/judges/creative-designer-avatar.png",
  },
  {
    id: 3,
    name: "Tech Guru",
    title: "Code Reviewer",
    tagline: "Clean code, better systems",
    rating: 9.7,
    price: 35,
    specialties: ["Code", "Architecture", "Performance"],
    color: "gold",
    avatar: "/judges/tech-expert-avatar.png",
  },
]

function FeaturedJudgesComponent() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {judges.map((judge) => (
        <div
          key={judge.id}
          className={`group relative rounded-[20px] bg-surface-1 border-2 transition-all duration-300 hover-lift overflow-hidden ${
            judge.color === "purple"
              ? "border-brand-purple/30 hover:border-brand-purple hover:glow-purple-strong"
              : judge.color === "cyan"
                ? "border-brand-cyan/30 hover:border-brand-cyan hover:glow-cyan"
                : "border-brand-gold/30 hover:border-brand-gold hover:glow-gold"
          }`}
        >
          {/* Avatar */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src={judge.avatar || "/placeholder.svg"}
              alt={judge.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-surface-1 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold mb-1">{judge.name}</h3>
                <p className="text-sm text-brand-cyan">{judge.title}</p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-gold/10 border border-brand-gold/30">
                <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
                <span className="text-sm font-mono font-bold text-brand-gold">{judge.rating}</span>
              </div>
            </div>

            <p className="text-sm text-foreground/60 mb-4 italic">"{judge.tagline}"</p>

            {/* Specialties */}
            <div className="flex flex-wrap gap-2 mb-4">
              {judge.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="px-2 py-1 text-xs rounded-md bg-surface-2 text-foreground/80 border border-border"
                >
                  {specialty}
                </span>
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
                className={`${
                  judge.color === "purple"
                    ? "bg-brand-purple hover:bg-brand-purple/90"
                    : judge.color === "cyan"
                      ? "bg-brand-cyan hover:bg-brand-cyan/90"
                      : "bg-brand-gold hover:bg-brand-gold/90"
                }`}
              >
                Select
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const FeaturedJudges = memo(FeaturedJudgesComponent)
