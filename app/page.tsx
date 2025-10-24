import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react"
import { FeaturedJudges } from "@/components/featured-judges"
import { RecentJudgments } from "@/components/recent-judgments"
import { SignInButton } from "@/components/auth/sign-in-button"
import { Logo } from "@/components/logo"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-xl font-bold bg-linear-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              JuryBox
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
              Marketplace
            </Link>
            <Link href="/dashboard" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <SignInButton variant="ghost" size="sm" />
            <Button size="sm" className="bg-brand-purple hover:bg-brand-purple/90">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-brand-purple/30 mb-6">
            <Sparkles className="w-4 h-4 text-brand-purple" />
            <span className="text-sm text-foreground/80">Powered by Expert AI Judges</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            Get Expert{" "}
            <span className="bg-linear-to-r from-brand-purple via-brand-cyan to-brand-gold bg-clip-text text-transparent">
              AI Judgments
            </span>{" "}
            on Your Work
          </h1>

          <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto text-pretty">
            Select from our marketplace of specialized AI judges to evaluate your content, get detailed feedback, and
            improve your work with expert insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-brand-purple hover:bg-brand-purple/90 glow-purple group">
              Start Judging
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="border-brand-cyan/30 hover:border-brand-cyan bg-transparent">
              Browse Judges
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Three Simple Steps</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-purple to-brand-purple/50 flex items-center justify-center mb-4 glow-purple">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Select Judges</h3>
              <p className="text-foreground/70">
                Choose up to 5 expert AI judges from our marketplace based on their specialties and ratings.
              </p>
            </div>

            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-cyan to-brand-cyan/50 flex items-center justify-center mb-4 glow-cyan">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Submit Content</h3>
              <p className="text-foreground/70">
                Upload your work, set evaluation criteria, and let our AI judges analyze your content.
              </p>
            </div>

            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-gold to-brand-gold/50 flex items-center justify-center mb-4 glow-gold">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Get Verdict</h3>
              <p className="text-foreground/70">
                Receive detailed scores, strengths, and improvement suggestions from each judge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Judges */}
      <section className="container mx-auto px-4 py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Judges</h2>
              <p className="text-foreground/70">Top-rated AI experts ready to evaluate your work</p>
            </div>
            <Button variant="ghost" className="text-brand-cyan hover:text-brand-cyan/80">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <FeaturedJudges />
        </div>
      </section>

      {/* Recent Judgments */}
      <section className="container mx-auto px-4 py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-10">Recent Judgments</h2>
          <RecentJudgments />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo size={32} />
                <span className="text-xl font-bold">JuryBox</span>
              </div>
              <p className="text-sm text-foreground/60">Expert AI judgments for your content</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link href="/marketplace">Marketplace</Link>
                </li>
                <li>
                  <Link href="/pricing">Pricing</Link>
                </li>
                <li>
                  <Link href="/how-it-works">How It Works</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li>
                  <Link href="/careers">Careers</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms</Link>
                </li>
                <li>
                  <Link href="/security">Security</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-foreground/60">
            © 2025 JuryBox. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
