'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SignInButton } from '@/components/auth/sign-in-button'
import { Logo } from '@/components/logo'

interface AppNavProps {
  currentPath?: string
  showCreateAgent?: boolean
}

export function AppNav({ currentPath = '/', showCreateAgent = true }: AppNavProps) {
  return (
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
            className={`text-sm transition-colors ${
              currentPath === '/marketplace'
                ? 'text-brand-purple font-medium'
                : 'text-foreground/80 hover:text-foreground'
            }`}
          >
            Marketplace
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm transition-colors ${
              currentPath === '/dashboard'
                ? 'text-brand-purple font-medium'
                : 'text-foreground/80 hover:text-foreground'
            }`}
          >
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <SignInButton variant="ghost" size="sm" />
          {showCreateAgent && (
            <Button size="sm" className="bg-brand-purple hover:bg-brand-purple/90" asChild>
              <Link href="/create-agent">Create Agent</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
