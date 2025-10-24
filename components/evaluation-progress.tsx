"use client"

import { Check, Loader2, MessageSquare, Calculator, Trophy } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { EvaluationProgress, ConsensusResult } from "@/types/agent"

interface EvaluationProgressProps {
  progress: EvaluationProgress
  consensusResult?: ConsensusResult
}

export function EvaluationProgressTracker({ progress, consensusResult }: EvaluationProgressProps) {
  const stages = [
    {
      id: 'initializing',
      label: 'Initializing',
      icon: Loader2,
      description: 'Setting up HCS communication layer',
    },
    {
      id: 'scoring',
      label: 'Independent Scoring',
      icon: Calculator,
      description: 'Agents evaluating content independently',
    },
    {
      id: 'discussing',
      label: 'Multi-Agent Discussion',
      icon: MessageSquare,
      description: 'Agents reviewing peer scores and adjusting',
    },
    {
      id: 'converging',
      label: 'Consensus Building',
      icon: Trophy,
      description: 'Aggregating scores via consensus algorithm',
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: Check,
      description: 'Final result published to Hedera',
    },
  ]

  const currentStageIndex = stages.findIndex((s) => s.id === progress.status)

  return (
    <Card className="p-6 bg-surface-1 border-border/50">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Multi-Agent Evaluation Progress</h3>
            <p className="text-sm text-foreground/60">
              {progress.scoresReceived}/{progress.totalAgents} agents • Round {progress.currentRound}/
              {progress.totalRounds}
            </p>
          </div>
          {progress.topicId && (
            <Badge variant="outline" className="font-mono text-xs">
              Topic: {progress.topicId.substring(0, 10)}...
            </Badge>
          )}
        </div>

        {/* Progress Stages */}
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIndex
            const isCurrent = index === currentStageIndex
            const isUpcoming = index > currentStageIndex

            const Icon = stage.icon

            return (
              <div
                key={stage.id}
                className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-brand-purple/10 border border-brand-purple/30'
                    : isCompleted
                      ? 'bg-surface-2 border border-border/50'
                      : 'bg-surface-0 border border-border/30 opacity-50'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-brand-cyan text-white'
                      : isCurrent
                        ? 'bg-brand-purple text-white animate-pulse'
                        : 'bg-surface-2 text-foreground/40'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isCurrent ? 'animate-spin' : ''}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{stage.label}</h4>
                    {isCurrent && (
                      <Badge className="bg-brand-purple text-white text-xs">In Progress</Badge>
                    )}
                    {isCompleted && <Badge variant="outline" className="text-xs">✓ Done</Badge>}
                  </div>
                  <p className="text-sm text-foreground/60">{stage.description}</p>

                  {/* Additional progress details */}
                  {isCurrent && stage.id === 'scoring' && (
                    <div className="mt-2 flex gap-2">
                      {Array.from({ length: progress.totalAgents }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full ${
                            i < progress.scoresReceived ? 'bg-brand-cyan' : 'bg-surface-2'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {isCurrent && stage.id === 'discussing' && progress.variance !== undefined && (
                    <div className="mt-2 text-xs text-foreground/70">
                      Variance: {progress.variance.toFixed(3)} • Converging...
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Consensus Result */}
        {consensusResult && progress.status === 'completed' && (
          <div className="p-4 rounded-lg bg-linear-to-br from-brand-purple/10 to-brand-cyan/10 border border-brand-purple/30">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-brand-purple mb-2">
                {consensusResult.finalScore.toFixed(2)}
                <span className="text-xl text-foreground/60">/10</span>
              </div>
              <p className="text-sm text-foreground/70">Final Consensus Score</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-foreground/60">Algorithm</div>
                <div className="font-semibold capitalize">
                  {consensusResult.algorithm.replace(/_/g, ' ')}
                </div>
              </div>
              <div>
                <div className="text-sm text-foreground/60">Confidence</div>
                <div className="font-semibold">{(consensusResult.confidence * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-sm text-foreground/60">Rounds</div>
                <div className="font-semibold">{consensusResult.convergenceRounds}</div>
              </div>
            </div>

            {/* Individual Scores */}
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="text-xs text-foreground/60 mb-2">Individual Agent Scores:</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(consensusResult.individualScores).map(([agentId, score]) => (
                  <Badge key={agentId} variant="secondary" className="text-xs">
                    {agentId.substring(0, 8)}: {score.toFixed(2)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HCS Link */}
        {progress.topicId && (
          <div className="text-center">
            <a
              href={`https://hashscan.io/testnet/topic/${progress.topicId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-cyan hover:underline"
            >
              View on Hedera Explorer →
            </a>
          </div>
        )}
      </div>
    </Card>
  )
}
