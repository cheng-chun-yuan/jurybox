'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface MarketplaceFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  categories: string[]
}

export function MarketplaceFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: MarketplaceFiltersProps) {
  return (
    <section className="border-b border-border/50 bg-background sticky top-[73px] z-30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" />
            <Input
              placeholder="Search judges by name, specialty, or expertise..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <SlidersHorizontal className="w-4 h-4 text-foreground/60 shrink-0" />
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange(category)}
                className={
                  selectedCategory === category
                    ? 'bg-brand-purple hover:bg-brand-purple/90'
                    : 'hover:border-brand-purple/50'
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
