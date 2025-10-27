export const CONTRACT_ADDRESSES = {
  IdentityRegistry: '0x4e79162582ec945aa0d5266009edef0f42b407e5',
  ReputationRegistry: '0xa9ed2f34b8342ac1b60bf4469cd704231af26021',
  ValidationRegistry: '0xa00c82e8c4096f10e5ea49798cf7fb047c2241ce',
  PaymentToken: '0xDab9Cf7aAC0dD94Fd353832Ea101069fEfD79CbD', // JBPT - JuryBox Payment Token
} as const

export type ContractName = keyof typeof CONTRACT_ADDRESSES

// JuryBox Payment Token (JBPT) Configuration
export const PAYMENT_TOKEN = {
  address: '0xDab9Cf7aAC0dD94Fd353832Ea101069fEfD79CbD' as const,
  name: 'JuryBox Payment Token',
  symbol: 'JBPT',
  decimals: 18,
  totalSupply: '1000000', // 1,000,000 JBPT
  chainId: 296, // Hedera Testnet
} as const
