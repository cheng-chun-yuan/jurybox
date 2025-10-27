"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Bot,
  Settings,
  Save,
  ArrowLeft,
  Wallet,
  Activity,
  RefreshCw,
  Edit3,
  X,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { getAccountBalance } from "@/lib/hedera/hedera-utils"

export default function OrchestratorPage() {
  const params = useParams()
  const router = useRouter()
  const [orchestrator, setOrchestrator] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [isLoadingOrchestrator, setIsLoadingOrchestrator] = useState(true)
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    config: {
      maxDiscussionRounds: 3,
      roundTimeout: 60000,
      consensusAlgorithm: "weighted_average",
      enableDiscussion: true,
      convergenceThreshold: 0.5,
      outlierDetection: true
    }
  })

  // Fetch orchestrator data from backend
  useEffect(() => {
    const fetchOrchestrator = async () => {
      if (!params.id) return

      setIsLoadingOrchestrator(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orchestrator/${params.id}`)

        if (!response.ok) {
          throw new Error('Failed to fetch orchestrator')
        }

        const data = await response.json()
        setOrchestrator(data)

        // Initialize edit data
        setEditData({
          name: data.name || '',
          description: data.description || '',
          systemPrompt: data.systemPrompt || '',
          config: data.config || {
            maxDiscussionRounds: 3,
            roundTimeout: 60000,
            consensusAlgorithm: "weighted_average",
            enableDiscussion: true,
            convergenceThreshold: 0.5,
            outlierDetection: true
          }
        })
      } catch (error) {
        console.error('Error fetching orchestrator:', error)
        alert('Failed to load orchestrator. Please try again.')
        router.push('/dashboard')
      } finally {
        setIsLoadingOrchestrator(false)
      }
    }

    fetchOrchestrator()
  }, [params.id])

  // Fetch real balance when orchestrator data is loaded
  useEffect(() => {
    const fetchBalance = async () => {
      if (orchestrator?.wallet?.accountId) {
        setIsLoadingBalance(true)
        try {
          const result = await getAccountBalance(orchestrator.wallet.accountId, 'testnet')
          if (!result.error) {
            setOrchestrator((prev: any) => ({
              ...prev,
              balance: result.balance
            }))
          }
        } catch (error) {
          console.error('Error fetching balance:', error)
        } finally {
          setIsLoadingBalance(false)
        }
      }
    }

    if (orchestrator && !isLoadingOrchestrator) {
      fetchBalance()
    }
  }, [orchestrator?.wallet?.accountId, isLoadingOrchestrator])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original data
    setEditData({
      name: orchestrator.name,
      description: orchestrator.description,
      systemPrompt: orchestrator.systemPrompt,
      config: { ...orchestrator.config }
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call to update orchestrator
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local state
      setOrchestrator(prev => ({
        ...prev,
        ...editData,
        lastUsed: "Just now"
      }))
      
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save orchestrator:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    try {
      // Fetch real balance from Hedera Mirror Node
      const result = await getAccountBalance(orchestrator.wallet.accountId, 'testnet')

      if (!result.error) {
        setOrchestrator(prev => ({
          ...prev,
          balance: result.balance
        }))
      } else {
        console.error('Error fetching balance:', result.error)
      }
    } catch (error) {
      console.error('Error refreshing balance:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Show loading state while fetching orchestrator
  if (isLoadingOrchestrator || !orchestrator) {
    return (
      <div className="min-h-screen">
        <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-40 bg-background/80">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={32} />
              <span className="text-xl font-bold bg-linear-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
                JuryBox
              </span>
            </Link>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8 max-w-4xl flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-brand-purple animate-spin mx-auto mb-4" />
            <p className="text-foreground/70">Loading orchestrator...</p>
          </div>
        </div>
      </div>
    )
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
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="outline"
              asChild
            >
              <Link href="/dashboard">
                <Settings className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Bot className="w-8 h-8 text-brand-purple" />
              {isEditing ? (
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-3xl font-bold border-none bg-transparent p-0 h-auto"
                />
              ) : (
                orchestrator.name || 'Orchestrator'
              )}
            </h1>
            <div className="flex items-center gap-4">
              <Badge variant={orchestrator.status === "active" ? "default" : "secondary"}>
                {orchestrator.status === "active" ? "Active" : "Inactive"}
              </Badge>
              {orchestrator.createdAt && <span className="text-foreground/60">Created {orchestrator.createdAt}</span>}
              {orchestrator.createdAt && orchestrator.lastUsed && <span className="text-foreground/60">•</span>}
              {orchestrator.lastUsed && <span className="text-foreground/60">Last used {orchestrator.lastUsed}</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEdit}
                className="bg-brand-purple hover:bg-brand-purple/90"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-5 h-5 text-brand-gold" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshBalance}
                disabled={isRefreshing || isLoadingBalance}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing || isLoadingBalance ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="text-2xl font-mono font-bold text-brand-gold mb-1">
              {isLoadingBalance ? (
                <div className="animate-pulse">--.--</div>
              ) : (
                (orchestrator.balance ?? 0).toFixed(2)
              )}
            </div>
            <div className="text-sm text-foreground/60">HBAR Balance</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-brand-purple" />
            </div>
            <div className="text-2xl font-mono font-bold mb-1">
              {orchestrator.evaluations ?? 0}
            </div>
            <div className="text-sm text-foreground/60">Evaluations</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Bot className="w-5 h-5 text-brand-cyan" />
            </div>
            <div className="text-2xl font-mono font-bold mb-1">
              {orchestrator.rounds?.completed ?? 0}
            </div>
            <div className="text-sm text-foreground/60">Rounds Completed</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Settings className="w-5 h-5 text-brand-purple" />
            </div>
            <div className="text-2xl font-mono font-bold mb-1">
              {orchestrator.config?.maxDiscussionRounds ?? 3}
            </div>
            <div className="text-sm text-foreground/60">Max Rounds</div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Orchestrator Details */}
          <div className="space-y-6">
            {/* Description */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-3">Description</h3>
              {isEditing ? (
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                  placeholder="Describe your orchestrator's purpose and capabilities..."
                />
              ) : (
                <p className="text-foreground/70">{orchestrator.description || 'No description provided'}</p>
              )}
            </Card>

            {/* System Prompt */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-3">System Prompt</h3>
              {isEditing ? (
                <Textarea
                  value={editData.systemPrompt}
                  onChange={(e) => setEditData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  className="min-h-[150px] font-mono text-sm"
                  placeholder="Define how your orchestrator should behave..."
                />
              ) : (
                <div className="bg-surface-1 p-4 rounded-lg">
                  <pre className="text-sm text-foreground/70 whitespace-pre-wrap font-mono">
                    {orchestrator.systemPrompt || 'No system prompt configured'}
                  </pre>
                </div>
              )}
            </Card>

            {/* Configuration */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-3">Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-foreground/70 mb-1 block">Max Discussion Rounds</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.config.maxDiscussionRounds}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          config: { ...prev.config, maxDiscussionRounds: parseInt(e.target.value) }
                        }))}
                        min="1"
                        max="10"
                      />
                    ) : (
                      <div className="text-lg font-mono font-bold">{orchestrator.config?.maxDiscussionRounds ?? 3}</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-foreground/70 mb-1 block">Round Timeout (ms)</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.config.roundTimeout}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          config: { ...prev.config, roundTimeout: parseInt(e.target.value) }
                        }))}
                        min="10000"
                        max="300000"
                      />
                    ) : (
                      <div className="text-lg font-mono font-bold">{(orchestrator.config?.roundTimeout ?? 60000).toLocaleString()}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-foreground/70 mb-1 block">Consensus Algorithm</label>
                    {isEditing ? (
                      <select
                        value={editData.config.consensusAlgorithm}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          config: { ...prev.config, consensusAlgorithm: e.target.value as any }
                        }))}
                        className="w-full p-2 border border-border/50 rounded-md bg-background"
                      >
                        <option value="simple_average">Simple Average</option>
                        <option value="weighted_average">Weighted Average</option>
                        <option value="median">Median</option>
                      </select>
                    ) : (
                      <div className="text-lg font-mono font-bold capitalize">
                        {(orchestrator.config?.consensusAlgorithm ?? 'weighted_average').replace('_', ' ')}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-foreground/70 mb-1 block">Convergence Threshold</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={editData.config.convergenceThreshold}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          config: { ...prev.config, convergenceThreshold: parseFloat(e.target.value) }
                        }))}
                      />
                    ) : (
                      <div className="text-lg font-mono font-bold">{orchestrator.config?.convergenceThreshold ?? 0.5}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.config.enableDiscussion}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        config: { ...prev.config, enableDiscussion: e.target.checked }
                      }))}
                      disabled={!isEditing}
                      className="rounded"
                    />
                    <span className="text-sm text-foreground/70">Enable Discussion</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.config.outlierDetection}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        config: { ...prev.config, outlierDetection: e.target.checked }
                      }))}
                      disabled={!isEditing}
                      className="rounded"
                    />
                    <span className="text-sm text-foreground/70">Outlier Detection</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Wallet Info (Read-only) */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-brand-gold" />
                Wallet Information
              </h3>
              <div className="space-y-3">
                {orchestrator.wallet?.accountId && (
                  <div>
                    <label className="text-sm text-foreground/70 mb-1 block">Account ID</label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-foreground bg-surface-1 px-3 py-2 rounded border">
                        {orchestrator.wallet.accountId}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(orchestrator.wallet.accountId)}
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                {orchestrator.wallet?.address && (
                  <div>
                    <label className="text-sm text-foreground/70 mb-1 block">Wallet Address</label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-foreground bg-surface-1 px-3 py-2 rounded border">
                        {orchestrator.wallet.address}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(orchestrator.wallet.address)}
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-amber-400">
                    <strong>Note:</strong> Wallet information cannot be changed for security reasons. 
                    The wallet is permanently associated with this orchestrator.
                  </p>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-cyan" />
                Recent Activity
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-foreground/70">Completed evaluation #8</span>
                  <span className="text-xs text-foreground/50 ml-auto">2h ago</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-foreground/70">Configuration updated</span>
                  <span className="text-xs text-foreground/50 ml-auto">1d ago</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-foreground/70">System prompt modified</span>
                  <span className="text-xs text-foreground/50 ml-auto">3d ago</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
