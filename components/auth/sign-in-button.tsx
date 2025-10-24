'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface SignInButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function SignInButton({ variant = 'ghost', size = 'sm', className }: SignInButtonProps) {
  const { ready, authenticated, login, logout, user } = usePrivy()

  // Don't render until Privy is ready
  if (!ready) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        Loading...
      </Button>
    )
  }

  if (authenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground/80 hidden sm:inline">
          {user.email?.address || user.wallet?.address?.slice(0, 6) + '...' + user.wallet?.address?.slice(-4)}
        </span>
        <Button variant={variant} size={size} className={className} onClick={logout}>
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    )
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={login}>
      Sign In
    </Button>
  )
}
