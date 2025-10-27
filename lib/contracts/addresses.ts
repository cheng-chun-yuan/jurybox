export const CONTRACT_ADDRESSES = {
  IdentityRegistry: '0x4e79162582ec945aa0d5266009edef0f42b407e5',
  ReputationRegistry: '0xa9ed2f34b8342ac1b60bf4469cd704231af26021',
  ValidationRegistry: '0xa00c82e8c4096f10e5ea49798cf7fb047c2241ce',
} as const

export type ContractName = keyof typeof CONTRACT_ADDRESSES
