"use client"

import { useState } from "react"
import { Sparkles, Star, Clock, TrendingUp, FileText, Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock dashboard data
const stats = {
  totalJudgments: 12,
  averageScore: 8.4,
  totalSpent: 324,
  favoriteJudge: "Dr. Academic",
}

const recentJudgments = [
  {
    id: "demo",
    title: "My Research Paper on AI Ethics",
    status: "completed",
    score: 8.5,
    judges: 2,
    submittedAt: "2 hours ago",
    category: "Academic",
  },
  {
    id: "2",
    title: "E-commerce Landing Page Design",
    status: "completed",
    score: 9.2,
    judges: 3,
    submittedAt: "1 day ago",
    category: "Creative",
  },
  {
    id: "3",
    title: "React Component Architecture",
    status: "in-progress",
    score: null,
    judges: 2,
    submittedAt: "2 days ago",
    category: "Technical",
  },
  {
    id: "4",
    title: "Marketing Campaign Strategy",
    status: "completed",
    score: 8.8,
    judges: 2,
    submittedAt: "3 days ago",
    category: "Business",
  },
  {
    id: "5",
    title: "Blog Post: Future of AI",
    status: "completed",
    score: 9.0,
    judges: 1,
    submittedAt: "5 days ago",
    category: "Writing",
  },
]

const favoriteJudges = [
  {
    id: 1,
    name: "Dr. Academic",
    avatar: "/professional-academic-avatar.jpg",
    timesUsed: 5,
    avgScore: 8.6,
  },
  {
    id: 2,
    name: "Creative Maven",
    avatar: "/creative-designer-avatar.png",
    timesUsed: 4,
    avgScore: 9.1,
  },
  {
    id: 3,
    name: "Tech Guru",
    avatar: "/tech-expert-avatar.png",
    timesUsed: 3,
    avgScore: 8.9,
  },
]

export default function DashboardPage() {
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "in-progress">("all")

  const filteredJudgments = recentJudgments.filter((j) => {
    if (filterStatus === "all") return true
    return j.status === filterStatus
  })

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-40 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-cyan flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              JudgeAI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
              Marketplace
            </Link>
            <Link href="/dashboard" className="text-sm text-brand-purple font-medium">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm" className="bg-brand-purple hover:bg-brand-purple/90" asChild>
              <Link href="/marketplace">
                <Plus className="w-4 h-4 mr-2" />
                New Judgment
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-foreground/70">Track your judgments and performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-brand-purple" />
              <TrendingUp className="w-4 h-4 text-brand-purple" />
            </div>
            <div className="text-3xl font-mono font-bold mb-1">{stats.totalJudgments}</div>
            <div className="text-sm text-foreground/60">Total Judgments</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
            </div>
            <div className="text-3xl font-mono font-bold mb-1">{stats.averageScore}</div>
            <div className="text-sm text-foreground/60">Average Score</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-mono font-bold mb-1 text-brand-gold">${stats.totalSpent}</div>
            <div className="text-sm text-foreground/60">Total Spent</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-brand-purple/10 to-brand-cyan/10 border-brand-purple/30">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-5 h-5 text-brand-purple" />
            </div>
            <div className="text-lg font-bold mb-1 truncate">{stats.favoriteJudge}</div>
            <div className="text-sm text-foreground/60">Favorite Judge</div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Judgments List */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Your Judgments</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                    className={filterStatus === "all" ? "bg-brand-purple hover:bg-brand-purple/90" : ""}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("completed")}
                    className={filterStatus === "completed" ? "bg-brand-purple hover:bg-brand-purple/90" : ""}
                  >
                    Completed
                  </Button>
                  <Button
                    variant={filterStatus === "in-progress" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("in-progress")}
                    className={filterStatus === "in-progress" ? "bg-brand-purple hover:bg-brand-purple/90" : ""}
                  >
                    In Progress
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredJudgments.map((judgment) => (
                  <Link
                    key={judgment.id}
                    href={`/results/${judgment.id}`}
                    className="block p-4 rounded-lg bg-surface-1 border border-border/50 hover:border-brand-purple/50 transition-all hover-lift"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{judgment.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {judgment.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-foreground/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {judgment.submittedAt}
                          </span>
                          <span>{judgment.judges} judges</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {judgment.status === "completed" ? (
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-purple/10 border border-brand-purple/30">
                            <Star className="w-4 h-4 text-brand-purple fill-brand-purple" />
                            <span className="text-lg font-mono font-bold text-brand-purple">{judgment.score}</span>
                          </div>
                        ) : (
                          <Badge className="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30">In Progress</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {filteredJudgments.length === 0 && (
                <div className="text-center py-12">
                  <Filter className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
                  <p className="text-foreground/60">No judgments found</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Favorite Judges */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Favorite Judges</h2>
              <div className="space-y-3">
                {favoriteJudges.map((judge) => (
                  <div
                    key={judge.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-surface-1 border border-border/50"
                  >
                    <img
                      src={judge.avatar || `/placeholder.svg?height=40&width=40&query=${judge.name}`}
                      alt={judge.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{judge.name}</div>
                      <div className="text-xs text-foreground/60">Used {judge.timesUsed} times</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
                      <span className="text-sm font-mono font-bold">{judge.avgScore}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <Link href="/marketplace">Browse All Judges</Link>
              </Button>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-gradient-to-br from-brand-purple/10 to-brand-cyan/10 border-brand-purple/30">
              <h3 className="font-bold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full bg-brand-purple hover:bg-brand-purple/90" asChild>
                  <Link href="/marketplace">
                    <Plus className="w-4 h-4 mr-2" />
                    New Judgment
                  </Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/marketplace">Browse Judges</Link>
                </Button>
              </div>
            </Card>

            {/* Performance Insights */}
            <Card className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-cyan" />
                Performance Insights
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-1">
                  <span className="text-foreground/70">Highest Score</span>
                  <span className="font-mono font-bold text-brand-gold">9.2</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-1">
                  <span className="text-foreground/70">Most Improved</span>
                  <span className="font-mono font-bold text-brand-cyan">+1.3</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-1">
                  <span className="text-foreground/70">This Month</span>
                  <span className="font-mono font-bold text-brand-purple">5 judgments</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
