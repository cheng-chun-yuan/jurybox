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

export default function CreateAgentPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [specialtyInput, setSpecialtyInput] = useState("")
  const [imagePreviewUrl, setImagePreviewUrl] = useState("")
  const [registrationResult, setRegistrationResult] = useState<{
    agentId: string
    cid: string
    ipfsUri: string
    txHash: string
  } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    tagline: "",
    bio: "",
    image: "",
    color: "purple" as "purple" | "cyan" | "gold",
    pricePerJudgment: 25,
    modelProvider: "openai" as "openai" | "anthropic" | "groq" | "ollama",
    modelName: "gpt-4",
    systemPrompt: "",
    temperature: 0.7,
  })

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch("/api/upload", {
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
    setIsCreating(true)

    try {
      console.log("Creating agent with ERC-8004 registration...")

      // Call API to register agent on-chain
      const response = await fetch("/api/agents/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.bio,
          image: formData.image || undefined,
          specialties,
          modelProvider: formData.modelProvider,
          modelName: formData.modelName,
          systemPrompt: formData.systemPrompt,
          temperature: formData.temperature,
          pricePerJudgment: formData.pricePerJudgment,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to register agent")
      }

      console.log("✅ Agent registered successfully!")
      console.log("Agent ID:", data.agent.agentId)
      console.log("IPFS URI:", data.agent.ipfsUri)
      console.log("TX Hash:", data.agent.txHash)

      // Extract CID from IPFS URI (ipfs://CID)
      const cid = data.agent.ipfsUri?.replace('ipfs://', '') || 'N/A'

      // Store registration result to display below form
      setRegistrationResult({
        agentId: data.agent.agentId,
        cid,
        ipfsUri: data.agent.ipfsUri,
        txHash: data.agent.txHash,
      })
    } catch (error: any) {
      console.error("Error creating agent:", error)
      alert(`Failed to create agent: ${error.message}`)
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-cyan flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
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
            <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              AI Judge Agent
            </span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Deploy a custom AI judge agent with Hedera blockchain integration, X402 payments, and ERC-8004 identity
            registration
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
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g., Rigorous analysis meets clarity"
                    required
                  />
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
                  <Label htmlFor="price">Price per Judgment (HBAR)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.pricePerJudgment}
                    onChange={(e) => setFormData({ ...formData, pricePerJudgment: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    Agents and users will pay this amount via X402 protocol
                  </p>
                </div>

                <div className="p-4 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg">
                  <p className="text-sm text-foreground/80">
                    <strong>ERC-8004 & Blockchain Integration:</strong>
                    <br />• Metadata uploaded to IPFS (Pinata)
                    <br />• Agent registered in ERC-8004 Identity Registry on Hedera
                    <br />• A2A endpoint for agent-to-agent communication
                    <br />• Agent wallet (CAIP-10) for payments
                    <br />• On-chain reputation tracking
                    <br />• X402 payment protocol for A2A transactions
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
                    Creating Agent...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Agent
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Registration Result */}
          {registrationResult && (
            <Card className="p-6 mt-8 bg-brand-cyan/10 border-brand-cyan/30">
              <h2 className="text-2xl font-bold mb-4 text-brand-cyan">✅ Agent Registered Successfully!</h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-foreground/70">Agent ID</Label>
                  <p className="text-lg font-mono">{registrationResult.agentId}</p>
                </div>
                <div>
                  <Label className="text-foreground/70">IPFS CID</Label>
                  <p className="text-lg font-mono break-all">{registrationResult.cid}</p>
                </div>
                <div>
                  <Label className="text-foreground/70">IPFS URI</Label>
                  <p className="text-sm font-mono break-all text-foreground/80">{registrationResult.ipfsUri}</p>
                </div>
                <div>
                  <Label className="text-foreground/70">Transaction Hash</Label>
                  <p className="text-sm font-mono break-all text-foreground/80">{registrationResult.txHash}</p>
                </div>
                <Button onClick={() => router.push("/marketplace")} className="w-full mt-4">
                  Go to Marketplace
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
