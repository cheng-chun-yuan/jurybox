"use client"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Judge {
  id: number
  name: string
  title: string
  price: number
  avatar: string
  color: "purple" | "cyan" | "gold"
}

interface JudgeSelectorProps {
  selectedJudges: Judge[]
  onRemove: (judgeId: number) => void
  onContinue: () => void
  maxJudges?: number
}

export function JudgeSelector({ selectedJudges, onRemove, onContinue, maxJudges = 5 }: JudgeSelectorProps) {
  const totalCost = selectedJudges.reduce((sum, judge) => sum + judge.price, 0)
  const canAddMore = selectedJudges.length < maxJudges

  if (selectedJudges.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-surface-1/95 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold">
                Selected Judges ({selectedJudges.length}/{maxJudges})
              </h3>
              {!canAddMore && <Badge variant="secondary">Max reached</Badge>}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedJudges.map((judge) => (
                <div
                  key={judge.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border"
                >
                  <img
                    src={judge.avatar || `/placeholder.svg?height=24&width=24&query=${judge.name}`}
                    alt={judge.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{judge.name}</span>
                  <span className="text-xs text-foreground/60">${judge.price}</span>
                  <button
                    onClick={() => onRemove(judge.id)}
                    className="ml-1 text-foreground/60 hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-foreground/60">Total Cost</div>
              <div className="text-2xl font-mono font-bold text-brand-gold">${totalCost}</div>
            </div>
            <Button
              size="lg"
              className="bg-brand-purple hover:bg-brand-purple/90 glow-purple"
              onClick={onContinue}
              disabled={selectedJudges.length === 0}
            >
              Continue to Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
