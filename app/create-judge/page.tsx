"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowLeft, Plus, X, Loader2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { useAccount } from "wagmi"

export default function CreateJudgePage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [isCreating, setIsCreating] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [specialtyInput, setSpecialtyInput] = useState("")
  const [imagePreviewUrl, setImagePreviewUrl] = useState("")
  const [registrationResult, setRegistrationResult] = useState<{
    judgeId: number
    cid: string
    ipfsUri: string
    txHash: string
    paymentPageUrl: string
    walletAddress: string
    evmAddress: string
  } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    tagline: "",
    bio: "",
    image: "",
    color: "purple" as "purple" | "cyan" | "gold",
    walletAddress: "",
    pricePerJudgment: 0.05,
    modelProvider: "openai" as "openai" | "anthropic" | "groq" | "ollama",
    modelName: "gpt-4",
    systemPrompt: "",
    temperature: 0.7,
  })

  // Set wallet address from connected wallet
  useEffect(() => {
    if (isConnected && address) {
      setFormData((prev) => ({ ...prev, walletAddress: address }))
    }
  }, [isConnected, address])

  // Debounce image preview updates to avoid making requests on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update preview if the URL looks complete (basic validation)
      if (formData.image && (formData.image.startsWith('http://') || formData.image.startsWith('https://'))) {
        setImagePreviewUrl(formData.image)
      } else if (!formData.image) {
        setImagePreviewUrl("")
      }
    }, 800) // Wait 800ms after user stops typing

    return () => clearTimeout(timer)
  }, [formData.image])

  const handleAddSpecialty = () => {
    if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
      setSpecialties([...specialties, specialtyInput.trim()])
      setSpecialtyInput("")
    }
  }

  const handleRemoveSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter((s) => s !== specialty))
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
        method: "POST",
        body: uploadFormData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Upload failed")
      }

      // Use the gateway URL for the image
      setFormData({ ...formData, image: data.gatewayUrl })
      setImagePreviewUrl(data.gatewayUrl) // Set preview immediately after upload
      alert(`Image uploaded to IPFS!\n\n${data.ipfsUri}`)
    } catch (error: any) {
      console.error("Image upload error:", error)
      alert(`Failed to upload image: ${error.message}`)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that at least one tag is selected
    if (selectedTags.length === 0) {
      alert("Please select at least one tagline")
      return
    }

    setIsCreating(true)

    try {
      console.log("Creating judge with blockchain registration...")

      // Map color names to hex values
      const colorMap = {
        purple: '#8B5CF6',
        cyan: '#06B6D4',
        gold: '#F59E0B',
      }

      // Call API to create judge
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/judges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          title: formData.title,
          tagline: selectedTags,
          description: formData.bio,
          avatar: formData.image || undefined,
          themeColor: colorMap[formData.color],
          specialties,
          modelProvider: formData.modelProvider,
          modelName: formData.modelName,
          systemPrompt: formData.systemPrompt,
          temperature: formData.temperature,
          price: formData.pricePerJudgment,
          walletAddress: formData.walletAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create judge")
      }

      console.log("✅ Judge registered successfully!")
      console.log("Judge ID:", data.judgeId)
      console.log("Wallet Address:", data.walletAddress)
      console.log("EVM Address:", data.evmAddress)
      console.log("Payment Page URL:", data.paymentPageUrl)
      console.log("Registry TX Hash:", data.registryTxHash)
      console.log("IPFS CID:", data.ipfsCid)

      // Store registration result to display below form
      setRegistrationResult({
        judgeId: data.judgeId,
        cid: data.ipfsCid || 'N/A',
        ipfsUri: data.ipfsCid ? `ipfs://${data.ipfsCid}` : 'N/A',
        txHash: data.registryTxHash || 'N/A',
        paymentPageUrl: data.paymentPageUrl,
        walletAddress: data.walletAddress || 'N/A',
        evmAddress: data.evmAddress || 'N/A',
      })
    } catch (error: any) {
      console.error("Error creating judge:", error)
      alert(`Failed to create judge: ${error.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-xl font-bold bg-linear-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              JuryBox
            </span>
          </Link>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/marketplace">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Link>
          </Button>
        </div>
      </nav>

      {/* Header */}
      <section className="border-b border-border/50 bg-surface-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Create Your{" "}
            <span className="bg-linear-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              AI Judge
            </span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Deploy a custom AI judge with Hedera blockchain integration, X402 payments, and IPFS metadata storage
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="p-6 bg-surface-1 border-border/50">
              <h2 className="text-2xl font-bold mb-6">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Dr. Academic"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Research Specialist"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tagline">Tagline (Select one or more)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Academic", "Creative", "Technical", "Business", "Writing", "Data"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-brand-purple text-white"
                            : "bg-surface-2 text-foreground/70 hover:bg-surface-3"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  {selectedTags.length > 0 ? (
                    <p className="text-xs text-brand-cyan mt-2">
                      Selected: {selectedTags.join(", ")}
                    </p>
                  ) : (
                    <p className="text-xs text-foreground/60 mt-2">
                      Select at least one tagline
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Biography / Description</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Describe your agent's background, expertise, and evaluation approach..."
                    rows={4}
                    required
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    This will be stored on IPFS and used in the ERC-8004 metadata
                  </p>
                </div>

                <div>
                  <Label htmlFor="image">Agent Image (optional)</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://example.com/agent-avatar.png or upload below"
                        type="url"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="flex-1"
                      />
                      {isUploadingImage && (
                        <Loader2 className="w-4 h-4 animate-spin text-brand-purple" />
                      )}
                    </div>
                    {imagePreviewUrl && (
                      <div className="p-2 bg-surface-2 rounded border border-border/50">
                        <img
                          src={imagePreviewUrl}
                          alt="Agent preview"
                          className="w-20 h-20 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/80?text=Invalid"
                          }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-foreground/60">
                      Upload image to IPFS or provide public URL (ERC-8004 standard)
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Theme Color</Label>
                  <div className="flex gap-3 mt-2">
                    {(["purple", "cyan", "gold"] as const).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          formData.color === color
                            ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                            : "hover:scale-105"
                        } ${
                          color === "purple"
                            ? "bg-brand-purple border-brand-purple ring-brand-purple"
                            : color === "cyan"
                              ? "bg-brand-cyan border-brand-cyan ring-brand-cyan"
                              : "bg-brand-gold border-brand-gold ring-brand-gold"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Specialties */}
            <Card className="p-6 bg-surface-1 border-border/50">
              <h2 className="text-2xl font-bold mb-6">Specialties</h2>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSpecialty())}
                    placeholder="Add a specialty..."
                  />
                  <Button type="button" onClick={handleAddSpecialty}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="pl-3 pr-2 py-1">
                        {specialty}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialty(specialty)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* AI Model Configuration */}
            <Card className="p-6 bg-surface-1 border-border/50">
              <h2 className="text-2xl font-bold mb-6">AI Model Configuration</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="modelProvider">Model Provider</Label>
                  <select
                    id="modelProvider"
                    value={formData.modelProvider}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        modelProvider: e.target.value as typeof formData.modelProvider,
                      })
                    }
                    className="w-full px-3 py-2 rounded-md border border-border bg-background"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="groq">Groq (Free)</option>
                    <option value="ollama">Ollama (Local)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="modelName">Model Name</Label>
                  <Input
                    id="modelName"
                    value={formData.modelName}
                    onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                    placeholder="e.g., gpt-4, claude-3-opus"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={formData.systemPrompt}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    placeholder="Define your agent's personality, expertise, and judging criteria..."
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="temperature">Temperature: {formData.temperature}</Label>
                  <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-foreground/60 mt-1">
                    <span>Deterministic</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Configuration (X402) */}
            <Card className="p-6 bg-surface-1 border-border/50">
              <h2 className="text-2xl font-bold mb-6">Payment Configuration (X402/A2A)</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="walletAddress">Wallet Address</Label>
                  <Input
                    id="walletAddress"
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    placeholder="0x... or 0.0.xxxxx"
                    required
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    {isConnected
                      ? "✓ Auto-filled from your connected wallet"
                      : "Hedera account ID or EVM address to receive payments"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="price">Price per Judgment (HBAR)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.001"
                    value={formData.pricePerJudgment}
                    onChange={(e) => setFormData({ ...formData, pricePerJudgment: parseFloat(e.target.value) })}
                    min="0.001"
                    required
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    Users will pay this amount per evaluation via X402 protocol
                  </p>
                </div>

                <div className="p-4 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg">
                  <p className="text-sm text-foreground/80">
                    <strong>Blockchain Integration:</strong>
                    <br />• Metadata uploaded to IPFS
                    <br />• Judge registered on-chain with Hedera
                    <br />• X402/A2A payment page auto-generated
                    <br />• Payments sent directly to your wallet address
                    <br />• On-chain reputation tracking
                  </p>
                </div>
              </div>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/marketplace")}
                className="flex-1"
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-brand-purple hover:bg-brand-purple/90"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Judge...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Judge
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Registration Result */}
          {registrationResult && (
            <Card className="p-6 mt-8 bg-brand-cyan/10 border-brand-cyan/30">
              <h2 className="text-2xl font-bold mb-4 text-brand-cyan">✅ Judge Registered Successfully!</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground/70">Judge ID</Label>
                  <p className="text-lg font-mono">{registrationResult.judgeId}</p>
                </div>

                <div>
                  <Label className="text-foreground/70">Hedera Wallet</Label>
                  <p className="text-sm font-mono break-all text-foreground/80 mb-1">
                    Account ID: {registrationResult.walletAddress || 'N/A'}
                  </p>
                  <p className="text-sm font-mono break-all text-foreground/80">
                    EVM Address: {registrationResult.evmAddress || 'N/A'}
                  </p>
                </div>

                {registrationResult.cid && registrationResult.cid !== 'N/A' && (
                  <div>
                    <Label className="text-foreground/70">IPFS Metadata</Label>
                    <p className="text-sm font-mono break-all text-foreground/80 mb-2">
                      CID: {registrationResult.cid}
                    </p>
                    <a
                      href={`https://ipfs.io/ipfs/${registrationResult.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-brand-cyan hover:text-brand-cyan/80 underline"
                    >
                      View on IPFS Gateway
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </div>
                )}

                {registrationResult.txHash && registrationResult.txHash !== 'N/A' && (
                  <div className="p-4 bg-brand-purple/10 border border-brand-purple/30 rounded-lg">
                    <Label className="text-foreground/70">Blockchain Registration</Label>
                    <p className="text-xs font-mono break-all text-foreground/60 mb-2 mt-1">
                      {registrationResult.txHash}
                    </p>
                    <a
                      href={`https://hashscan.io/testnet/transaction/${registrationResult.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-brand-purple hover:text-brand-purple/80 underline"
                    >
                      View on HashScan
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <Button
                    onClick={() => router.push("/marketplace")}
                    className="flex-1"
                    variant="outline"
                  >
                    Go to Marketplace
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-brand-purple hover:bg-brand-purple/90"
                  >
                    Create Another Judge
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
