"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Star,
  Clock,
  TrendingUp,
  FileText,
  Plus,
  Filter,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  Bot,
  Users,
  Activity,
  RefreshCw,
  ExternalLink,
  X,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { SignInButton } from "@/components/auth/sign-in-button";
import { useAccount } from "wagmi";
import { useHederaWallet } from "@/components/providers/rainbow-provider";
// Mock orchestrator data
const orchestrators = [
  {
    id: "orch-001",
    name: "Academic Review Orchestrator",
    status: "active",
    balance: 15.5,
    evaluations: 8,
    rounds: { completed: 24, total: 24, current: 0 },
    createdAt: "2024-01-15",
    lastUsed: "2 hours ago",
    wallet: {
      address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      accountId: "0.0.7125500"
    }
  },
  {
    id: "orch-002", 
    name: "Creative Content Orchestrator",
    status: "active",
    balance: 8.2,
    evaluations: 12,
    rounds: { completed: 36, total: 36, current: 0 },
    createdAt: "2024-01-10",
    lastUsed: "1 day ago",
    wallet: {
      address: "0x3acfa47617c313Fae5F27D7e7128578fCEf5ED94",
      accountId: "0.0.7125500"
    }
  },
  {
    id: "orch-003",
    name: "Technical Review Orchestrator", 
    status: "low_balance",
    balance: 2.1,
    evaluations: 5,
    rounds: { completed: 15, total: 15, current: 0 },
    createdAt: "2024-01-20",
    lastUsed: "3 days ago",
    wallet: {
      address: "0x8f2a0acf5f70d87f6a9e2c6b4c8d1e3f5a7b9c0d",
      accountId: "0.0.7125500"
    }
  }
];

const agents = [
  {
    id: "agent-001",
    name: "Dr. Academic",
    type: "judge",
    status: "active",
    earnings: 45.2,
    evaluations: 23,
    rating: 8.6,
    lastActive: "1 hour ago"
  },
  {
    id: "agent-002",
    name: "Creative Maven", 
    type: "judge",
    status: "active",
    earnings: 38.7,
    evaluations: 18,
    rating: 9.1,
    lastActive: "2 hours ago"
  },
  {
    id: "agent-003",
    name: "Tech Guru",
    type: "judge", 
    status: "inactive",
    earnings: 22.1,
    evaluations: 12,
    rating: 8.9,
    lastActive: "1 day ago"
  }
];

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { transferToAAWallet, isTransferring: walletTransferring } = useHederaWallet()
  const [activeTab, setActiveTab] = useState<"orchestrators" | "agents">("orchestrators")
  const [fundingAmount, setFundingAmount] = useState("")
  const [isFunding, setIsFunding] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedOrchestrator, setSelectedOrchestrator] = useState<string | null>(null)
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [fundingOrchestrator, setFundingOrchestrator] = useState<any>(null)

  const totalBalance = orchestrators.reduce((sum, orch) => sum + orch.balance, 0)
  const totalEvaluations = orchestrators.reduce((sum, orch) => sum + orch.evaluations, 0)
  const activeOrchestrators = orchestrators.filter(orch => orch.status === "active").length

  const handleFundClick = (orchestrator: any) => {
    setFundingOrchestrator(orchestrator)
    setShowFundingModal(true)
    setFundingAmount("")
  }

  const [isTransferring, setIsTransferring] = useState(false)
  const [lastTransferResult, setLastTransferResult] = useState<any>(null)

  const handleFundOrchestrator = async () => {
    if (!fundingAmount || !fundingOrchestrator) return
    
    setIsFunding(true)
    try {
      // Use the AA wallet transfer function
      console.log(`Funding AA wallet for orchestrator ${fundingOrchestrator.id} with ${fundingAmount} HBAR`)
      console.log(`AA Wallet Account ID: ${fundingOrchestrator.wallet.accountId}`)
      console.log(`AA Wallet Address: ${fundingOrchestrator.wallet.address}`)
      
      const aaWalletInfo = {
        accountId: fundingOrchestrator.wallet.accountId,
        evmAddress: fundingOrchestrator.wallet.address,
        name: fundingOrchestrator.name // Use orchestrator name as user name
      }
      
      const result = await transferToAAWallet(aaWalletInfo, parseFloat(fundingAmount), 'testnet')
      
      if (result.success) {
        console.log('Transfer to AA wallet successful:', result)
        setLastTransferResult(result)
        setFundingAmount("")
        setShowFundingModal(false)
        setFundingOrchestrator(null)
      } else {
        alert(`Funding AA wallet failed: ${result.error}`)
      }
      
    } catch (error) {
      console.error('Funding AA wallet failed:', error)
      alert('Funding AA wallet failed')
    } finally {
      setIsFunding(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    try {
      // This would call the balance API
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      setIsRefreshing(false)
    }
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

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/marketplace"
              className="text-sm text-foreground/80 hover:text-foreground transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-brand-purple font-medium"
            >
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <SignInButton variant="ghost" size="sm" />
            <Button
              size="sm"
              className="bg-brand-purple hover:bg-brand-purple/90"
              asChild
            >
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
          <p className="text-foreground/70">
            Manage your orchestrators and agents
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-5 h-5 text-brand-purple" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshBalance}
                disabled={isRefreshing}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="text-3xl font-mono font-bold mb-1 text-brand-gold">
              {totalBalance.toFixed(1)}
            </div>
            <div className="text-sm text-foreground/60">Total HBAR Balance</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Bot className="w-5 h-5 text-brand-cyan" />
              <Badge variant="secondary" className="text-xs">
                {activeOrchestrators} active
              </Badge>
            </div>
            <div className="text-3xl font-mono font-bold mb-1">
              {orchestrators.length}
            </div>
            <div className="text-sm text-foreground/60">Orchestrators</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-brand-purple" />
              <TrendingUp className="w-4 h-4 text-brand-purple" />
            </div>
            <div className="text-3xl font-mono font-bold mb-1">
              {totalEvaluations}
            </div>
            <div className="text-sm text-foreground/60">Total Evaluations</div>
          </Card>

          <Card className="p-6 bg-linear-to-br from-brand-purple/10 to-brand-cyan/10 border-brand-purple/30">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-brand-purple" />
            </div>
            <div className="text-lg font-bold mb-1">
              All Systems Active
            </div>
            <div className="text-sm text-foreground/60">
              Everything running smoothly
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-1 border border-border/50 w-fit">
            <Button
              variant={activeTab === "orchestrators" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("orchestrators")}
              className={activeTab === "orchestrators" ? "bg-brand-purple hover:bg-brand-purple/90" : ""}
            >
              <Bot className="w-4 h-4 mr-2" />
              Orchestrators
            </Button>
            <Button
              variant={activeTab === "agents" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("agents")}
              className={activeTab === "agents" ? "bg-brand-purple hover:bg-brand-purple/90" : ""}
            >
              <Users className="w-4 h-4 mr-2" />
              Agents
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Orchestrators/Agents List */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {activeTab === "orchestrators" ? "Your Orchestrators" : "Your Agents"}
                </h2>
                <Button
                  className="bg-brand-purple hover:bg-brand-purple/90"
                  asChild
                >
                  <Link href={activeTab === "orchestrators" ? "/submit" : "/create-judge"}>
                    <Plus className="w-4 h-4 mr-2" />
                    New {activeTab === "orchestrators" ? "Orchestrator" : "Agent"}
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {activeTab === "orchestrators" ? (
                  orchestrators.map((orchestrator) => (
                    <div
                      key={orchestrator.id}
                      className="p-4 rounded-lg bg-surface-1 border border-border/50 hover:border-brand-purple/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{orchestrator.name}</h3>
                            <Badge 
                              variant={orchestrator.status === "active" ? "default" : "secondary"}
                            >
                              {orchestrator.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-foreground/60 mb-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {orchestrator.lastUsed}
                            </span>
                            <span>{orchestrator.evaluations} evaluations</span>
                            <span>{orchestrator.rounds.completed} rounds completed</span>
                          </div>
                          <div className="text-xs text-foreground/50 font-mono">
                            Wallet: {orchestrator.wallet.address.slice(0, 8)}...{orchestrator.wallet.address.slice(-6)}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-mono font-bold text-brand-gold">
                              {orchestrator.balance}
                            </div>
                            <div className="text-xs text-foreground/60">HBAR</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFundClick(orchestrator)}
                          className="flex-1"
                        >
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          Fund
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Manage
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/orchestrator/${orchestrator.id}`}>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="p-4 rounded-lg bg-surface-1 border border-border/50 hover:border-brand-purple/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{agent.name}</h3>
                            <Badge 
                              variant={agent.status === "active" ? "default" : "secondary"}
                            >
                              {agent.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {agent.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-foreground/60 mb-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {agent.lastActive}
                            </span>
                            <span>{agent.evaluations} evaluations</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-lg font-mono font-bold text-brand-gold">
                              {agent.earnings}
                            </div>
                            <div className="text-xs text-foreground/60">HBAR earned</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
                            <span className="font-mono font-bold">{agent.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <ArrowDownLeft className="w-3 h-3 mr-1" />
                          Claim Earnings
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {((activeTab === "orchestrators" && orchestrators.length === 0) || 
                (activeTab === "agents" && agents.length === 0)) && (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
                  <p className="text-foreground/60 mb-4">
                    No {activeTab} found
                  </p>
                  <Button
                    className="bg-brand-purple hover:bg-brand-purple/90"
                    asChild
                  >
                    <Link href={activeTab === "orchestrators" ? "/submit" : "/create-judge"}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First {activeTab === "orchestrators" ? "Orchestrator" : "Agent"}
                    </Link>
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <Card className="p-6 bg-linear-to-br from-brand-purple/10 to-brand-cyan/10 border-brand-purple/30">
              <h3 className="font-bold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  className="w-full bg-brand-purple hover:bg-brand-purple/90"
                  asChild
                >
                  <Link href="/submit">
                    <Bot className="w-4 h-4 mr-2" />
                    New Orchestrator
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  asChild
                >
                  <Link href="/create-judge">
                    <Users className="w-4 h-4 mr-2" />
                    New Agent
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  asChild
                >
                  <Link href="/marketplace">
                    <Star className="w-4 h-4 mr-2" />
                    Browse Judges
                  </Link>
                </Button>
              </div>
            </Card>


            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-cyan" />
                Recent Activity
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-foreground/70">Academic Orchestrator completed evaluation</span>
                  <span className="text-xs text-foreground/50 ml-auto">2h ago</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-foreground/70">Creative Orchestrator funded +5 HBAR</span>
                  <span className="text-xs text-foreground/50 ml-auto">1d ago</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-foreground/70">Technical Orchestrator low balance warning</span>
                  <span className="text-xs text-foreground/50 ml-auto">3d ago</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Transfer Success Notification */}
      {lastTransferResult && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h4 className="font-medium text-green-400">Transfer Successful!</h4>
            </div>
            <div className="space-y-2 text-sm text-foreground/70">
              <p><strong>Amount:</strong> {lastTransferResult.amount || 'N/A'} HBAR</p>
              <p><strong>Transaction ID:</strong> <span className="font-mono text-xs">{lastTransferResult.transactionId}</span></p>
              {lastTransferResult.hashscanUrl && (
                <div className="flex items-center gap-2">
                  <span><strong>View on Hashscan:</strong></span>
                  <a 
                    href={lastTransferResult.hashscanUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open
                  </a>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLastTransferResult(null)}
              className="mt-2 h-6 px-2 text-xs"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Funding Modal */}
      {showFundingModal && fundingOrchestrator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border/50 rounded-lg shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-amber-400">Fund Orchestrator</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowFundingModal(false)
                  setFundingOrchestrator(null)
                  setFundingAmount("")
                }}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Orchestrator Info */}
              <div className="p-4 rounded-lg bg-surface-1 border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">{fundingOrchestrator.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Account ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-foreground">{fundingOrchestrator.wallet.accountId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(fundingOrchestrator.wallet.accountId)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Wallet Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-foreground">
                        {fundingOrchestrator.wallet.address.slice(0, 8)}...{fundingOrchestrator.wallet.address.slice(-6)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(fundingOrchestrator.wallet.address)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Current Balance:</span>
                    <span className="font-mono font-bold text-brand-gold">
                      {fundingOrchestrator.balance} HBAR
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400 mt-3">
                  <strong>Note:</strong> Hedera transfers use Account ID ({fundingOrchestrator.wallet.accountId}) instead of EVM address
                </div>
              </div>

              {/* Funding Amount */}
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-2 block">
                  Amount to Fund (HBAR)
                </label>
                <Input
                  type="number"
                  placeholder="10.0"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  className="text-lg"
                  step="0.00000001"
                  min="0"
                  max="999999999"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleFundOrchestrator}
                  disabled={!fundingAmount || isFunding || walletTransferring}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {walletTransferring ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Hedera Transfer...
                    </>
                  ) : isFunding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Fund {fundingAmount ? `${fundingAmount} HBAR` : ''}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFundingModal(false)
                    setFundingOrchestrator(null)
                    setFundingAmount("")
                  }}
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
