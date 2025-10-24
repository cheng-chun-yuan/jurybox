"use client"

import { useState } from "react"
import { Sparkles, Star, ThumbsUp, Download, Share2, TrendingUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

// Mock judgment data
const judgmentData = {
  id: "demo",
  title: "My Research Paper on AI Ethics",
  submittedAt: "2 hours ago",
  status: "completed",
  overallScore: 8.5,
  judges: [
    {
      id: 1,
      name: "Dr. Academic",
      avatar: "/judges/professional-academic-avatar.jpg",
      score: 8.7,
      verdict: "Strong research with minor improvements needed",
      strengths: [
        "Well-structured argumentation with clear thesis",
        "Comprehensive literature review covering recent developments",
        "Strong methodology and data analysis",
      ],
      improvements: [
        "Consider expanding the discussion on ethical implications",
        "Some citations need formatting corrections",
        "Add more real-world case studies to support claims",
      ],
      detailedFeedback:
        "This is a well-researched paper that demonstrates a strong understanding of AI ethics. The literature review is comprehensive and up-to-date. However, I recommend expanding the discussion section to explore more nuanced ethical dilemmas. The methodology is sound, but additional case studies would strengthen your arguments significantly.",
    },
    {
      id: 2,
      name: "Creative Maven",
      avatar: "/judges/creative-designer-avatar.png",
      score: 8.3,
      verdict: "Good content, presentation could be enhanced",
      strengths: [
        "Clear and accessible writing style",
        "Effective use of examples to illustrate concepts",
        "Good flow between sections",
      ],
      improvements: [
        "Add visual diagrams to explain complex concepts",
        "Consider restructuring the introduction for more impact",
        "Use more engaging headings and subheadings",
      ],
      detailedFeedback:
        "From a presentation standpoint, your paper communicates complex ideas effectively. The writing is clear and accessible. To take it to the next level, consider adding visual elements like diagrams or infographics to break up dense text and illustrate key concepts. The introduction could be restructured to hook readers more effectively.",
    },
  ],
}

export default function ResultsPage() {
  const [selectedJudge, setSelectedJudge] = useState(judgmentData.judges[0])

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-40 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-brand-purple to-brand-cyan flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              JudgeAI
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{judgmentData.title}</h1>
              <p className="text-foreground/60">Submitted {judgmentData.submittedAt}</p>
            </div>
            <Badge className="bg-brand-purple/10 text-brand-purple border-brand-purple/30">Completed</Badge>
          </div>

          {/* Overall Score */}
          <Card className="p-6 bg-linear-to-br from-brand-purple/10 to-brand-cyan/10 border-brand-purple/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Overall Score</h2>
                <p className="text-sm text-foreground/70">Average from {judgmentData.judges.length} judges</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-5xl font-mono font-bold text-brand-gold">{judgmentData.overallScore}</div>
                  <div className="text-sm text-foreground/60">out of 10</div>
                </div>
                <Star className="w-12 h-12 text-brand-gold fill-brand-gold" />
              </div>
            </div>
          </Card>
        </div>

        {/* Judge Tabs */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Judge Selector */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold mb-3">Judges</h3>
            <div className="space-y-2">
              {judgmentData.judges.map((judge) => (
                <button
                  key={judge.id}
                  onClick={() => setSelectedJudge(judge)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedJudge.id === judge.id
                      ? "bg-brand-purple/10 border-brand-purple"
                      : "bg-surface-1 border-border hover:border-brand-purple/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={judge.avatar || `/placeholder.svg?height=40&width=40&query=${judge.name}`}
                      alt={judge.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{judge.name}</div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
                        <span className="text-sm font-mono font-bold">{judge.score}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Judge Feedback */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* Judge Header */}
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-border/50">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      selectedJudge.avatar || `/placeholder.svg?height=60&width=60&query=${selectedJudge.name} avatar`
                    }
                    alt={selectedJudge.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{selectedJudge.name}</h3>
                    <p className="text-brand-cyan italic">"{selectedJudge.verdict}"</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-mono font-bold text-brand-gold">{selectedJudge.score}</div>
                  <div className="text-sm text-foreground/60">Score</div>
                </div>
              </div>

              {/* Detailed Feedback */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="strengths">Strengths</TabsTrigger>
                  <TabsTrigger value="improvements">Improvements</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Detailed Feedback</h4>
                    <p className="text-foreground/70 leading-relaxed">{selectedJudge.detailedFeedback}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-lg bg-brand-purple/5 border border-brand-purple/20">
                      <div className="flex items-center gap-2 mb-2">
                        <ThumbsUp className="w-4 h-4 text-brand-purple" />
                        <span className="font-semibold text-brand-purple">
                          {selectedJudge.strengths.length} Strengths
                        </span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-brand-cyan/5 border border-brand-cyan/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-brand-cyan" />
                        <span className="font-semibold text-brand-cyan">
                          {selectedJudge.improvements.length} Areas to Improve
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="strengths" className="space-y-3">
                  {selectedJudge.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-brand-purple/5 border border-brand-purple/20"
                    >
                      <ThumbsUp className="w-5 h-5 text-brand-purple mt-0.5 flex-shrink-0" />
                      <p className="text-foreground/80">{strength}</p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="improvements" className="space-y-3">
                  {selectedJudge.improvements.map((improvement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-brand-cyan/5 border border-brand-cyan/20"
                    >
                      <AlertCircle className="w-5 h-5 text-brand-cyan mt-0.5 flex-shrink-0" />
                      <p className="text-foreground/80">{improvement}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/marketplace">Submit Another</Link>
          </Button>
          <Button className="bg-brand-purple hover:bg-brand-purple/90" asChild>
            <Link href="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
