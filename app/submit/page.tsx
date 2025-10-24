"use client"

import { useState, useEffect, useMemo } from "react"
import { Sparkles, Upload, FileText, CheckCircle2, ArrowRight, ArrowLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { SignInButton } from "@/components/auth/sign-in-button"
import { Logo } from "@/components/logo"
import { getJudgesByIds } from "@/lib/judges-database"

const steps = [
  { id: 1, name: "Judges", icon: Sparkles },
  { id: 2, name: "Criteria", icon: FileText },
  { id: 3, name: "Test", icon: Upload },
  { id: 4, name: "Review", icon: CheckCircle2 },
]

export default function SubmitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    systemName: "",
    description: "",
    criteria: "",
    additionalNotes: "",
    testContent: "",
    budget: "",
    ownerAddress: "",
  })
  const [isTestingResults, setIsTestingResults] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [isCreatingOrchestrator, setIsCreatingOrchestrator] = useState(false)
  const [orchestratorResult, setOrchestratorResult] = useState<any>(null)

  // Get selected judges from URL params
  const selectedJudges = useMemo(() => {
    const judgeIds = searchParams.get('judges')
    if (!judgeIds) {
      // Redirect back to marketplace if no judges selected
      router.push('/marketplace')
      return []
    }

    const ids = judgeIds.split(',').map(Number)

    // Fetch judges from centralized database
    return getJudgesByIds(ids).map(judge => ({
      id: judge.id,
      name: judge.name,
      price: judge.price,
      avatar: judge.avatar,
    }))
  }, [searchParams, router])

  const totalCost = selectedJudges.reduce((sum, judge) => sum + judge.price, 0)

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Create orchestrator system
      await handleCreateOrchestrator()
    }
  }

  const handleCreateOrchestrator = async () => {
    setIsCreatingOrchestrator(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orchestrator/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          judgeIds: selectedJudges.map(j => j.id),
          systemName: formData.systemName,
          criteria: formData.criteria,
          budget: parseFloat(formData.budget),
          ownerAddress: formData.ownerAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create orchestrator')
      }

      setOrchestratorResult(data)

      // Show success and redirect after delay
      setTimeout(() => {
        router.push(`/systems/${data.system.id}`)
      }, 2000)

    } catch (error) {
      console.error('Error creating orchestrator:', error)
      alert(error instanceof Error ? error.message : 'Failed to create orchestrator system')
    } finally {
      setIsCreatingOrchestrator(false)
    }
  }

  const handleRunTest = async () => {
    if (!formData.testContent) return

    setIsTestingResults(true)
    setTestResults(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orchestrator/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          judgeIds: selectedJudges.map(j => j.id),
          testContent: formData.testContent,
          criteria: formData.criteria,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run test evaluation')
      }

      setTestResults(data.evaluation)

    } catch (error) {
      console.error('Error running test:', error)
      alert(error instanceof Error ? error.message : 'Failed to run test evaluation')
    } finally {
      setIsTestingResults(false)
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
    if (currentStep === 1) return selectedJudges.length > 0
    if (currentStep === 2) return formData.systemName && formData.criteria
    if (currentStep === 3) return true // Test step is optional
    if (currentStep === 4) {
      return formData.budget && parseFloat(formData.budget) >= totalCost && formData.ownerAddress
    }
    return true
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-40 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-xl font-bold bg-linear-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              JuryBox
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <SignInButton variant="ghost" size="sm" />
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
                <h2 className="text-2xl font-bold mb-2">Selected Judges</h2>
                <p className="text-foreground/70">Review the judges you selected from the marketplace</p>
              </div>

              <div className="space-y-3">
                {selectedJudges.map((judge) => (
                  <div
                    key={judge.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-surface-2 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={judge.avatar || `/placeholder.svg?height=48&width=48&query=${judge.name}`}
                        alt={judge.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span className="font-medium">{judge.name}</span>
                    </div>
                    <span className="font-mono font-bold text-brand-gold">${judge.price} / judgment</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-brand-purple/5 border border-brand-purple/20">
                <p className="text-sm text-foreground/70">
                  <strong>Note:</strong> You're creating a reusable judge system. Once created, you can submit content for evaluation anytime via API or web interface.
                </p>
              </div>

              <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push('/marketplace')}>
                Change Judges Selection
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Configure Judge System</h2>
                <p className="text-foreground/70">Set up your reusable evaluation system</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="systemName">System Name *</Label>
                  <Input
                    id="systemName"
                    placeholder="e.g., Research Paper Evaluator"
                    value={formData.systemName}
                    onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-foreground/60 mt-2">A descriptive name for your judge system</p>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What types of content will this system evaluate?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="criteria">Evaluation Criteria *</Label>
                  <Textarea
                    id="criteria"
                    placeholder="e.g., Focus on clarity, technical accuracy, and practical applicability..."
                    value={formData.criteria}
                    onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                    className="mt-1.5 min-h-[200px]"
                  />
                  <p className="text-xs text-foreground/60 mt-2">Define what aspects judges should focus on</p>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific guidelines or context for the judges..."
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
                <h2 className="text-2xl font-bold mb-2">Test Your Judge System (Optional)</h2>
                <p className="text-foreground/70">Try evaluating sample content to see how your judges will respond</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="testContent">Test Content</Label>
                  <Textarea
                    id="testContent"
                    placeholder="Paste sample content here to test your judge system..."
                    value={formData.testContent}
                    onChange={(e) => setFormData({ ...formData, testContent: e.target.value })}
                    className="mt-1.5 min-h-[200px]"
                  />
                  <p className="text-xs text-foreground/60 mt-2">This content will be evaluated by your selected judges</p>
                </div>

                <Button
                  onClick={handleRunTest}
                  disabled={!formData.testContent || isTestingResults}
                  className="w-full bg-brand-cyan hover:bg-brand-cyan/90"
                >
                  {isTestingResults ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Running Evaluation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run Test Evaluation
                    </>
                  )}
                </Button>
              </div>

              {/* Test Results */}
              {testResults && (
                <div className="space-y-4 mt-6">
                  {/* Consensus Summary */}
                  <div className="p-6 rounded-lg bg-linear-to-br from-brand-purple/10 to-brand-cyan/10 border border-brand-purple/30">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-foreground/60">Consensus Score</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-6 h-6 text-brand-gold fill-brand-gold" />
                          <span className="text-3xl font-mono font-bold text-brand-gold">
                            {testResults.averageScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-foreground/60">Confidence</span>
                        <div className="text-2xl font-mono font-bold text-brand-cyan mt-1">
                          {(testResults.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-foreground/60">Convergence</span>
                        <div className="text-2xl font-mono font-bold text-brand-purple mt-1">
                          {testResults.convergenceRounds} rounds
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground/60">Algorithm:</span>
                        <span className="font-mono font-medium">{testResults.algorithm}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-foreground/60">Variance:</span>
                        <span className="font-mono font-medium">{testResults.variance?.toFixed(3) || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-foreground/60">HCS Topic ID:</span>
                        <span className="font-mono text-xs">{testResults.topicId}</span>
                      </div>
                    </div>
                  </div>

                  {/* HCS Message Timeline */}
                  {testResults.hcsMessages && testResults.hcsMessages.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-cyan" />
                        HCS Consensus Timeline
                      </h3>
                      {testResults.hcsMessages.map((round: any, roundIdx: number) => (
                        <Card key={roundIdx} className="p-4 bg-surface-1">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">
                              {round.roundNumber === 0 ? 'Initial Scoring' : `Discussion Round ${round.roundNumber}`}
                            </h4>
                            <span className="text-xs text-foreground/60 font-mono">
                              {round.duration}ms
                            </span>
                          </div>
                          <div className="space-y-2">
                            {round.messages.map((msg: any, msgIdx: number) => (
                              <div
                                key={msgIdx}
                                className="p-3 rounded-lg bg-surface-2 border border-border/30"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{msg.agentName}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple">
                                      {msg.type}
                                    </span>
                                  </div>
                                  <span className="text-xs text-foreground/60 font-mono">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                {msg.data.score !== undefined && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
                                    <span className="font-mono font-bold">{msg.data.score.toFixed(2)}</span>
                                    {msg.data.reasoning && (
                                      <span className="text-foreground/70 text-xs ml-2">
                                        {msg.data.reasoning}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {msg.data.content && (
                                  <p className="text-sm text-foreground/70">{msg.data.content}</p>
                                )}
                                {msg.data.adjustedScore !== undefined && (
                                  <div className="text-sm text-foreground/70">
                                    Adjusted: {msg.data.originalScore.toFixed(2)} → {msg.data.adjustedScore.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Judge Feedback */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Final Judge Evaluations</h3>
                    {testResults.judges.map((judge: any) => (
                      <Card key={judge.id} className="p-4 bg-surface-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{judge.name}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
                            <span className="font-mono font-bold">{judge.score.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/70 mb-3">{judge.feedback}</p>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-brand-cyan">Strengths:</span>
                            <ul className="mt-1 space-y-1 text-foreground/70">
                              {judge.strengths.map((s: string, idx: number) => (
                                <li key={idx}>• {s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium text-brand-purple">Improvements:</span>
                            <ul className="mt-1 space-y-1 text-foreground/70">
                              {judge.improvements.map((i: string, idx: number) => (
                                <li key={idx}>• {i}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-brand-cyan/5 border border-brand-cyan/20">
                <p className="text-sm text-foreground/70">
                  <strong>Note:</strong> This is a test evaluation to help you understand how your judge system will work. You can skip this step and proceed to create your system.
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Review & Fund System</h2>
                <p className="text-foreground/70">Review configuration and fund your orchestrator</p>
              </div>

              {/* System Info */}
              <div>
                <h3 className="font-semibold mb-3">System Information</h3>
                <div className="p-4 rounded-lg bg-surface-2 border border-border/50 space-y-2">
                  <div>
                    <span className="text-sm text-foreground/60">Name:</span>
                    <h4 className="font-medium">{formData.systemName}</h4>
                  </div>
                  {formData.description && (
                    <div>
                      <span className="text-sm text-foreground/60">Description:</span>
                      <p className="text-sm text-foreground/70">{formData.description}</p>
                    </div>
                  )}
                </div>
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
                      <span className="font-mono font-bold text-brand-gold">${judge.price} / judgment</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Criteria Summary */}
              <div>
                <h3 className="font-semibold mb-3">Evaluation Criteria</h3>
                <div className="p-4 rounded-lg bg-surface-2 border border-border/50">
                  <p className="text-sm text-foreground/70 whitespace-pre-wrap">{formData.criteria}</p>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="p-6 rounded-lg bg-linear-to-br from-brand-purple/10 to-brand-cyan/10 border border-brand-purple/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">Cost Per Evaluation</span>
                  <span className="text-3xl font-mono font-bold text-brand-gold">${totalCost.toFixed(3)}</span>
                </div>
                <p className="text-sm text-foreground/60">
                  Each evaluation will cost ${totalCost.toFixed(3)} using {selectedJudges.length} judges
                </p>
              </div>

              {/* Budget and Owner Address */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="budget">Budget (HBAR) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.001"
                    min={totalCost}
                    placeholder={`Minimum: ${totalCost.toFixed(3)} HBAR`}
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-foreground/60 mt-2">
                    Fund the orchestrator to enable evaluations. Minimum: ${totalCost.toFixed(3)} ({Math.floor(parseFloat(formData.budget || "0") / totalCost)} evaluations)
                  </p>
                </div>

                <div>
                  <Label htmlFor="ownerAddress">Owner Address *</Label>
                  <Input
                    id="ownerAddress"
                    placeholder="0.0.xxxxx (Hedera Account ID)"
                    value={formData.ownerAddress}
                    onChange={(e) => setFormData({ ...formData, ownerAddress: e.target.value })}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-foreground/60 mt-2">
                    The Hedera account that will own and control this orchestrator
                  </p>
                </div>
              </div>

              {/* Orchestrator Creation Result */}
              {orchestratorResult && (
                <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/30">
                  <h4 className="font-medium mb-2 text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Orchestrator Created Successfully!
                  </h4>
                  <div className="space-y-2 text-sm text-foreground/70">
                    <p><strong>System ID:</strong> {orchestratorResult.system.id}</p>
                    <p><strong>Status:</strong> {orchestratorResult.system.status}</p>
                    <p><strong>Budget:</strong> {orchestratorResult.system.budget.total} HBAR</p>
                    <p><strong>Available Evaluations:</strong> {orchestratorResult.system.budget.remainingEvaluations}</p>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-brand-cyan/5 border border-brand-cyan/20">
                <h4 className="font-medium mb-2 text-brand-cyan flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  What happens next?
                </h4>
                <ul className="space-y-1 text-sm text-foreground/70">
                  <li>✓ Orchestrator will be created and funded on Hedera</li>
                  <li>✓ HCS topic will be initialized for multi-agent communication</li>
                  <li>✓ Ownership will be assigned to your Hedera account</li>
                  <li>✓ You can submit content for evaluation anytime via API or web interface</li>
                  <li>✓ Each evaluation will use your configured judges and criteria</li>
                </ul>
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
            disabled={!canProceed() || isCreatingOrchestrator}
            className="bg-brand-purple hover:bg-brand-purple/90 gap-2"
          >
            {isCreatingOrchestrator ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Creating Orchestrator...
              </>
            ) : currentStep === 4 ? (
              <>
                Create & Fund Orchestrator
                <ArrowRight className="w-4 h-4" />
              </>
            ) : currentStep === 3 ? (
              <>
                Skip Test & Continue
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
