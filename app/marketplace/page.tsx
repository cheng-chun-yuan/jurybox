"use client"

import { useState, lazy, Suspense } from "react"
import { useRouter } from "next/navigation"
import { AppNav } from "@/components/layout/app-nav"
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header"
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters"
import { JudgeGrid } from "@/components/marketplace/judge-grid"
import { JudgeSelector } from "@/components/judge-selector"
import { useMarketplaceFilters } from "@/hooks/use-marketplace-filters"
import { useJudgeSelection } from "@/hooks/use-judge-selection"
import { getAllJudges } from "@/lib/judges-database"

// Lazy load heavy modal component
const JudgeDetailModal = lazy(() => import("@/components/judge-detail-modal").then(mod => ({ default: mod.JudgeDetailModal })))

// Get all judges from centralized database
const allJudges = getAllJudges()

const categories = ["All", "Academic", "Creative", "Technical", "Business", "Writing", "Data"]

export default function MarketplacePage() {
  const router = useRouter()
  const [detailJudge, setDetailJudge] = useState<(typeof allJudges)[0] | null>(null)

  // Use custom hooks for cleaner state management
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, filteredJudges } =
    useMarketplaceFilters(allJudges)

  const { selectedJudges, selectJudge, removeJudge, isSelected } = useJudgeSelection(5)

  const handleContinue = () => {
    // Pass selected judge IDs via URL params
    const judgeIds = selectedJudges.map(j => j.id).join(',')
    router.push(`/submit?judges=${judgeIds}`)
  }

  return (
    <div className="min-h-screen pb-32">
      <AppNav currentPath="/marketplace" />
      <MarketplaceHeader />
      <MarketplaceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
      />
      <JudgeGrid
        judges={filteredJudges}
        selectedJudges={selectedJudges}
        onSelectJudge={(id) => {
          const judge = allJudges.find((j) => j.id === id)
          if (judge) selectJudge(judge)
        }}
        onViewDetails={setDetailJudge}
      />
      <Suspense fallback={null}>
        <JudgeDetailModal
          judge={detailJudge}
          open={!!detailJudge}
          onClose={() => setDetailJudge(null)}
          onSelect={(id) => {
            const judge = allJudges.find((j) => j.id === id)
            if (judge) selectJudge(judge)
          }}
          selected={detailJudge ? isSelected(detailJudge.id) : false}
        />
      </Suspense>
      <JudgeSelector
        selectedJudges={selectedJudges}
        onRemove={removeJudge}
        onContinue={handleContinue}
        maxJudges={5}
      />
    </div>
  )
}
