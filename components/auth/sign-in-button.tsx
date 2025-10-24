'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'

interface SignInButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function SignInButton({ variant = 'ghost', size = 'sm', className }: SignInButtonProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    variant={variant}
                    size={size}
                    className={className}
                    onClick={openConnectModal}
                  >
                    Sign In
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    variant={variant}
                    size={size}
                    className={className}
                    onClick={openChainModal}
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground/80 hidden sm:inline">
                    {account.displayName}
                  </span>
                  <Button
                    variant={variant}
                    size={size}
                    className={className}
                    onClick={openAccountModal}
                  >
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
