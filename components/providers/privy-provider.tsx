'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'

export function PrivyClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#8B5CF6',
          logo: '/logo.svg',
        },
        loginMethods: ['email', 'wallet'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: {
          id: 296,
          name: 'Hedera Testnet',
          network: 'hedera-testnet',
          nativeCurrency: {
            name: 'HBAR',
            symbol: 'HBAR',
            decimals: 8,
          },
          rpcUrls: {
            default: {
              http: ['https://testnet.hashio.io/api'],
            },
            public: {
              http: ['https://testnet.hashio.io/api'],
            },
          },
          blockExplorers: {
            default: {
              name: 'HashScan',
              url: 'https://hashscan.io/testnet',
            },
          },
        },
        supportedChains: [
          {
            id: 296,
            name: 'Hedera Testnet',
            network: 'hedera-testnet',
            nativeCurrency: {
              name: 'HBAR',
              symbol: 'HBAR',
              decimals: 8,
            },
            rpcUrls: {
              default: {
                http: ['https://testnet.hashio.io/api'],
              },
              public: {
                http: ['https://testnet.hashio.io/api'],
              },
            },
            blockExplorers: {
              default: {
                name: 'HashScan',
                url: 'https://hashscan.io/testnet',
              },
            },
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  )
}
