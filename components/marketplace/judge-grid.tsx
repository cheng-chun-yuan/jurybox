'use client'

import { Filter } from 'lucide-react'
import { JudgeCard } from '@/components/judge-card'
import { Badge } from '@/components/ui/badge'
import type { Judge } from '@/lib/judges-database'

interface JudgeGridProps {
  judges: Judge[]
  selectedJudges: Judge[]
  onSelectJudge: (judgeId: number) => void
  onViewDetails: (judge: Judge) => void
}

export function JudgeGrid({ judges, selectedJudges, onSelectJudge, onViewDetails }: JudgeGridProps) {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <p className="text-foreground/70">
          {judges.length} {judges.length === 1 ? 'judge' : 'judges'} found
        </p>
        {selectedJudges.length > 0 && (
          <Badge variant="secondary" className="bg-brand-purple/10 text-brand-purple border-brand-purple/30">
            {selectedJudges.length} selected
          </Badge>
        )}
      </div>

      {judges.length === 0 ? (
        <div className="text-center py-20">
          <Filter className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No judges found</h3>
          <p className="text-foreground/60">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {judges.map((judge) => (
            <JudgeCard
              key={judge.id}
              judge={judge}
              onSelect={(e: React.MouseEvent) => {
                e.stopPropagation()
                onSelectJudge(judge.id)
              }}
              onViewDetails={(e: React.MouseEvent) => {
                e.stopPropagation()
                onViewDetails(judge)
              }}
              selected={selectedJudges.some((j) => j.id === judge.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
