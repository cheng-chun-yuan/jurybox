"use client"

import { useState } from "react"
import { Sparkles, Upload, FileText, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

const steps = [
  { id: 1, name: "Content", icon: Upload },
  { id: 2, name: "Criteria", icon: FileText },
  { id: 3, name: "Review", icon: CheckCircle2 },
]

export default function SubmitPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    contentType: "text",
    criteria: "",
    additionalNotes: "",
  })

  // Mock selected judges (in real app, would come from state management)
  const selectedJudges = [
    { id: 1, name: "Dr. Academic", price: 25, avatar: "/professional-academic-avatar.jpg" },
    { id: 2, name: "Creative Maven", price: 30, avatar: "/creative-designer-avatar.png" },
  ]

  const totalCost = selectedJudges.reduce((sum, judge) => sum + judge.price, 0)

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      // Submit and redirect to results
      router.push("/results/demo")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push("/marketplace")
    }
  }

  const canProceed = () => {
    if (currentStep === 1) return formData.title && formData.content
    if (currentStep === 2) return formData.criteria
    return true
  }

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

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10">
              <div
                className="h-full bg-brand-purple transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {steps.map((step) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? "bg-brand-purple border-brand-purple text-white"
                        : isActive
                          ? "bg-brand-purple/10 border-brand-purple text-brand-purple"
                          : "bg-surface-1 border-border text-foreground/60"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-sm font-medium ${isActive ? "text-brand-purple" : isCompleted ? "text-foreground" : "text-foreground/60"}`}
                  >
                    {step.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Submit Your Content</h2>
                <p className="text-foreground/70">Provide the content you want the judges to evaluate</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., My Research Paper on AI Ethics"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste your content here or describe what you'd like evaluated..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="mt-1.5 min-h-[300px]"
                  />
                  <p className="text-xs text-foreground/60 mt-2">You can paste text, code, or describe your project</p>
                </div>

                <div className="p-4 rounded-lg bg-surface-2 border border-border/50">
                  <div className="flex items-start gap-3">
                    <Upload className="w-5 h-5 text-brand-cyan mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">File Upload (Coming Soon)</h4>
                      <p className="text-sm text-foreground/70">
                        Soon you'll be able to upload documents, images, and other files directly
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Evaluation Criteria</h2>
                <p className="text-foreground/70">Tell the judges what aspects to focus on</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="criteria">What should the judges evaluate? *</Label>
                  <Textarea
                    id="criteria"
                    placeholder="e.g., Focus on clarity, technical accuracy, and practical applicability..."
                    value={formData.criteria}
                    onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                    className="mt-1.5 min-h-[200px]"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional context or specific questions for the judges..."
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    className="mt-1.5 min-h-[120px]"
                  />
                </div>

                <div className="p-4 rounded-lg bg-brand-purple/5 border border-brand-purple/20">
                  <h4 className="font-medium mb-2 text-brand-purple">Suggested Criteria</h4>
                  <ul className="space-y-1 text-sm text-foreground/70">
                    <li>• Clarity and organization</li>
                    <li>• Technical accuracy and depth</li>
                    <li>• Originality and creativity</li>
                    <li>• Practical applicability</li>
                    <li>• Areas for improvement</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
                <p className="text-foreground/70">Confirm your submission details before proceeding</p>
              </div>

              {/* Selected Judges */}
              <div>
                <h3 className="font-semibold mb-3">Selected Judges ({selectedJudges.length})</h3>
                <div className="space-y-2">
                  {selectedJudges.map((judge) => (
                    <div
                      key={judge.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={judge.avatar || `/placeholder.svg?height=40&width=40&query=${judge.name}`}
                          alt={judge.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{judge.name}</span>
                      </div>
                      <span className="font-mono font-bold text-brand-gold">${judge.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Summary */}
              <div>
                <h3 className="font-semibold mb-3">Content</h3>
                <div className="p-4 rounded-lg bg-surface-2 border border-border/50">
                  <h4 className="font-medium mb-2">{formData.title}</h4>
                  <p className="text-sm text-foreground/70 line-clamp-3">{formData.content}</p>
                </div>
              </div>

              {/* Criteria Summary */}
              <div>
                <h3 className="font-semibold mb-3">Evaluation Criteria</h3>
                <div className="p-4 rounded-lg bg-surface-2 border border-border/50">
                  <p className="text-sm text-foreground/70">{formData.criteria}</p>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="p-6 rounded-lg bg-gradient-to-br from-brand-purple/10 to-brand-cyan/10 border border-brand-purple/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground/70">Total Cost</span>
                  <span className="text-3xl font-mono font-bold text-brand-gold">${totalCost}</span>
                </div>
                <p className="text-sm text-foreground/60">
                  You'll receive detailed feedback from {selectedJudges.length} expert judges
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBack} className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? "Back to Marketplace" : "Back"}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-brand-purple hover:bg-brand-purple/90 gap-2"
          >
            {currentStep === 3 ? "Submit for Judgment" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
