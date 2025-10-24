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
import { useAllJudges } from "@/hooks/use-judges-api"

// Lazy load heavy modal component
const JudgeDetailModal = lazy(() => import("@/components/judge-detail-modal").then(mod => ({ default: mod.JudgeDetailModal })))

const categories = ["All", "Academic", "Creative", "Technical", "Business", "Writing", "Data"]

export default function MarketplacePage() {
  const router = useRouter()

  // Fetch all judges from backend API
  const { judges: allJudges, loading: loadingJudges, error: judgesError } = useAllJudges()

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

      {/* Loading State */}
      {loadingJudges && (
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin mb-4" />
            <p className="text-foreground/70">Loading judges...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {judgesError && (
        <div className="container mx-auto px-4 py-16">
          <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 max-w-md mx-auto">
            <h4 className="font-medium mb-2 text-red-400">Error Loading Judges</h4>
            <p className="text-sm text-foreground/70">{judgesError}</p>
          </div>
        </div>
      )}

      {/* Judges Grid - Only show when loaded */}
      {!loadingJudges && !judgesError && (
        <JudgeGrid
          judges={filteredJudges}
          selectedJudges={selectedJudges}
          onSelectJudge={(id) => {
            const judge = allJudges.find((j) => j.id === id)
            if (judge) selectJudge(judge)
          }}
          onViewDetails={setDetailJudge}
        />
      )}
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
