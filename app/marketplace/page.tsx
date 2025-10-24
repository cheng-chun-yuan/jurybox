"use client"

import { useState } from "react"
import { Search, Filter, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { JudgeCard } from "@/components/judge-card"
import { JudgeDetailModal } from "@/components/judge-detail-modal"
import { JudgeSelector } from "@/components/judge-selector"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SignInButton } from "@/components/auth/sign-in-button"
import { Logo } from "@/components/logo"

// Mock data for judges
const allJudges = [
  {
    id: 1,
    name: "Dr. Academic",
    title: "Research Specialist",
    tagline: "Rigorous analysis meets clarity",
    rating: 9.8,
    reviews: 342,
    price: 0.025,
    specialties: ["Research", "Academic", "Analysis"],
    color: "purple" as const,
    avatar: "/judges/professional-academic-avatar.jpg",
    trending: true,
    bio: "With over 15 years of experience in academic research and peer review, I provide comprehensive analysis that combines scholarly rigor with practical insights.",
    expertise: [
      "Academic paper structure and argumentation",
      "Research methodology evaluation",
      "Citation and reference quality assessment",
      "Statistical analysis review",
    ],
    achievements: [
      "Published 50+ peer-reviewed papers",
      "Former editor at Nature Communications",
      "PhD in Computational Biology from MIT",
    ],
    sampleReviews: [
      {
        rating: 9.9,
        comment: "Incredibly detailed feedback that helped me improve my thesis significantly.",
        author: "Sarah M.",
        date: "2 days ago",
      },
      {
        rating: 9.7,
        comment: "Professional and thorough analysis. Worth every penny.",
        author: "James K.",
        date: "1 week ago",
      },
    ],
  },
  {
    id: 2,
    name: "Creative Maven",
    title: "Design Critic",
    tagline: "Where art meets innovation",
    rating: 9.5,
    reviews: 289,
    price: 0.03,
    specialties: ["Design", "Creative", "UX"],
    color: "cyan" as const,
    avatar: "/judges/creative-designer-avatar.png",
    trending: true,
    bio: "Award-winning designer with a passion for user-centered design. I help creators elevate their work through actionable, creative feedback.",
    expertise: [
      "Visual hierarchy and composition",
      "User experience and interaction design",
      "Brand identity and consistency",
      "Accessibility and inclusive design",
    ],
    achievements: [
      "Winner of 3 Webby Awards",
      "Lead Designer at Fortune 500 companies",
      "Featured in Design Week Magazine",
    ],
    sampleReviews: [
      {
        rating: 9.8,
        comment: "Transformed my portfolio with insightful design critiques.",
        author: "Alex P.",
        date: "3 days ago",
      },
      {
        rating: 9.2,
        comment: "Great eye for detail and user experience.",
        author: "Maria L.",
        date: "5 days ago",
      },
    ],
  },
  {
    id: 3,
    name: "Tech Guru",
    title: "Code Reviewer",
    tagline: "Clean code, better systems",
    rating: 9.7,
    reviews: 412,
    price: 0.035,
    specialties: ["Code", "Architecture", "Performance"],
    color: "gold" as const,
    avatar: "/judges/tech-expert-avatar.png",
    bio: "Senior software architect specializing in scalable systems and clean code practices. I provide technical reviews that improve code quality and system design.",
    expertise: [
      "Code quality and best practices",
      "System architecture and scalability",
      "Performance optimization",
      "Security and vulnerability assessment",
    ],
    achievements: [
      "Built systems serving 100M+ users",
      "Open source contributor with 10k+ GitHub stars",
      "Former Tech Lead at Google",
    ],
    sampleReviews: [
      {
        rating: 9.9,
        comment: "Caught critical issues I missed. Excellent technical depth.",
        author: "David R.",
        date: "1 day ago",
      },
      {
        rating: 9.5,
        comment: "Best code review I've ever received. Very thorough.",
        author: "Emma T.",
        date: "4 days ago",
      },
    ],
  },
  {
    id: 4,
    name: "Business Strategist",
    title: "Market Analyst",
    tagline: "Data-driven insights for growth",
    rating: 9.4,
    reviews: 198,
    price: 0.028,
    specialties: ["Business", "Strategy", "Marketing"],
    color: "purple" as const,
    avatar: "/business-strategist-avatar.jpg",
    bio: "MBA with 12 years of experience in business strategy and market analysis. I help entrepreneurs validate ideas and refine their business models.",
    expertise: [
      "Business model validation",
      "Market opportunity analysis",
      "Competitive landscape assessment",
      "Go-to-market strategy",
    ],
    achievements: ["Advised 50+ successful startups", "Former McKinsey consultant", "MBA from Harvard Business School"],
    sampleReviews: [
      {
        rating: 9.6,
        comment: "Helped me pivot my business model successfully.",
        author: "Tom H.",
        date: "1 week ago",
      },
    ],
  },
  {
    id: 5,
    name: "Content Wizard",
    title: "Writing Coach",
    tagline: "Words that resonate and convert",
    rating: 9.6,
    reviews: 267,
    price: 0.022,
    specialties: ["Writing", "Content", "Copywriting"],
    color: "cyan" as const,
    avatar: "/content-writer-avatar.jpg",
    bio: "Professional writer and editor with expertise in content strategy and persuasive copywriting. I help writers craft compelling narratives.",
    expertise: [
      "Content structure and flow",
      "Tone and voice consistency",
      "SEO and readability optimization",
      "Persuasive copywriting techniques",
    ],
    achievements: [
      "Published author with 3 bestsellers",
      "Content strategist for major brands",
      "10+ years in editorial leadership",
    ],
    sampleReviews: [
      {
        rating: 9.7,
        comment: "My blog posts improved dramatically after this feedback.",
        author: "Lisa W.",
        date: "2 days ago",
      },
    ],
  },
  {
    id: 6,
    name: "Data Scientist",
    title: "Analytics Expert",
    tagline: "Turning data into decisions",
    rating: 9.3,
    reviews: 156,
    price: 0.032,
    specialties: ["Data", "Analytics", "ML"],
    color: "gold" as const,
    avatar: "/data-scientist-avatar.jpg",
    trending: true,
    bio: "PhD in Statistics with expertise in machine learning and data analysis. I provide rigorous evaluation of data projects and analytical approaches.",
    expertise: [
      "Statistical methodology",
      "Machine learning model evaluation",
      "Data visualization best practices",
      "Experimental design",
    ],
    achievements: ["PhD in Statistics from Stanford", "Published 30+ papers on ML", "Led data teams at tech unicorns"],
    sampleReviews: [
      {
        rating: 9.5,
        comment: "Excellent statistical insights and methodology review.",
        author: "Chris B.",
        date: "3 days ago",
      },
    ],
  },
]

const categories = ["All", "Academic", "Creative", "Technical", "Business", "Writing", "Data"]

export default function MarketplacePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedJudges, setSelectedJudges] = useState<typeof allJudges>([])
  const [detailJudge, setDetailJudge] = useState<(typeof allJudges)[0] | null>(null)

  const filteredJudges = allJudges.filter((judge) => {
    const matchesSearch =
      judge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judge.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      selectedCategory === "All" ||
      judge.specialties.some((s) => s.toLowerCase().includes(selectedCategory.toLowerCase()))

    return matchesSearch && matchesCategory
  })

  const handleSelectJudge = (judgeId: number) => {
    const judge = allJudges.find((j) => j.id === judgeId)
    if (!judge) return

    const isSelected = selectedJudges.some((j) => j.id === judgeId)
    if (isSelected) {
      setSelectedJudges(selectedJudges.filter((j) => j.id !== judgeId))
    } else if (selectedJudges.length < 5) {
      setSelectedJudges([...selectedJudges, judge])
    }
  }

  const handleRemoveJudge = (judgeId: number) => {
    setSelectedJudges(selectedJudges.filter((j) => j.id !== judgeId))
  }

  const handleContinue = () => {
    router.push("/submit")
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-40 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-xl font-bold bg-linear-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              JuryBox
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className="text-sm text-brand-purple font-medium">
              Marketplace
            </Link>
            <Link href="/dashboard" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <SignInButton variant="ghost" size="sm" />
            <Button size="sm" className="bg-brand-purple hover:bg-brand-purple/90" asChild>
              <Link href="/create-agent">Create Agent</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="border-b border-border/50 bg-surface-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Browse Expert{" "}
            <span className="bg-linear-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              AI Judges
            </span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Select up to 5 specialized judges to evaluate your work and provide detailed feedback
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border/50 bg-background sticky top-[73px] z-30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" />
              <Input
                placeholder="Search judges by name, specialty, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <SlidersHorizontal className="w-4 h-4 text-foreground/60 shrink-0" />
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? "bg-brand-purple hover:bg-brand-purple/90"
                      : "hover:border-brand-purple/50"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <p className="text-foreground/70">
            {filteredJudges.length} {filteredJudges.length === 1 ? "judge" : "judges"} found
          </p>
          {selectedJudges.length > 0 && (
            <Badge variant="secondary" className="bg-brand-purple/10 text-brand-purple border-brand-purple/30">
              {selectedJudges.length} selected
            </Badge>
          )}
        </div>

        {filteredJudges.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No judges found</h3>
            <p className="text-foreground/60">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJudges.map((judge) => (
              <JudgeCard
                key={judge.id}
                judge={judge}
                onSelect={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  handleSelectJudge(judge.id)
                }}
                onViewDetails={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  setDetailJudge(judge)
                }}
                selected={selectedJudges.some((j) => j.id === judge.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Judge Detail Modal */}
      <JudgeDetailModal
        judge={detailJudge}
        open={!!detailJudge}
        onClose={() => setDetailJudge(null)}
        onSelect={handleSelectJudge}
        selected={detailJudge ? selectedJudges.some((j) => j.id === detailJudge.id) : false}
      />

      {/* Judge Selector */}
      <JudgeSelector
        selectedJudges={selectedJudges}
        onRemove={handleRemoveJudge}
        onContinue={handleContinue}
        maxJudges={5}
      />
    </div>
  )
}
