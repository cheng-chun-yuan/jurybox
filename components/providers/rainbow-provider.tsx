"use client"

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { hederaTestnet, sepolia } from 'viem/chains'
import { createContext, useContext, ReactNode } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { transferHBARViaEVM, requestHederaNetwork, processTransactionReceipt } from '@/lib/hedera/hedera-evm';

// Hedera Wallet Context
interface HederaWalletContextType {
  transferHBAR: (toAccountId: string, amount: number, network?: 'testnet' | 'mainnet') => Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
    hashscanUrl?: string;
  }>;
  transferToAAWallet: (aaWalletInfo: {
    accountId: string;
    evmAddress: string;
    name?: string;
  }, amount: number, network?: 'testnet' | 'mainnet') => Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
    hashscanUrl?: string;
  }>;
  switchToHederaNetwork: (network?: 'testnet' | 'mainnet') => Promise<boolean>;
  processReceipt: (transactionHash: string, network?: 'testnet' | 'mainnet') => Promise<{
    success: boolean;
    receipt?: any;
    fromEVMAddress?: string;
    toEVMAddress?: string;
    error?: string;
  }>;
  isConnected: boolean;
  address: string | undefined;
  isTransferring: boolean;
}

const HederaWalletContext = createContext<HederaWalletContextType | undefined>(undefined);

// Hedera Wallet Provider Component
function HederaWalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt();

  const isTransferring = isWritePending || isConfirming;

  const switchToHederaNetwork = async (network: 'testnet' | 'mainnet' = 'testnet'): Promise<boolean> => {
    try {
      return await requestHederaNetwork(network);
    } catch (error) {
      console.error('Error switching to Hedera network:', error);
      return false;
    }
  };

  const processReceipt = async (
    transactionHash: string, 
    network: 'testnet' | 'mainnet' = 'testnet'
  ) => {
    try {
      console.log(`Processing receipt for transaction: ${transactionHash}`);
      const result = await processTransactionReceipt(transactionHash, network);
      
      if (result.success) {
        console.log(`Receipt processed successfully - From: ${result.fromEVMAddress}, To: ${result.toEVMAddress}`);
      }
      
      return result;
    } catch (error) {
      console.error('Error processing receipt:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process receipt'
      };
    }
  };

  const transferHBAR = async (
    toAccountId: string, 
    amount: number, 
    network: 'testnet' | 'mainnet' = 'testnet'
  ) => {
    if (!isConnected || !address) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    try {
      // Switch to Hedera network first
      const networkSwitched = await switchToHederaNetwork(network);
      if (!networkSwitched) {
        return {
          success: false,
          error: 'Failed to switch to Hedera network'
        };
      }

      // Execute the transfer using our Hedera EVM integration
      const result = await transferHBARViaEVM(toAccountId, amount, address, network);
      
      return {
        success: result.success,
        transactionHash: result.transactionHash,
        error: result.error,
        hashscanUrl: result.hashscanUrl
      };
    } catch (error) {
      console.error('Error transferring HBAR:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed'
      };
    }
  };

  const transferToAAWallet = async (
    aaWalletInfo: {
      accountId: string;
      evmAddress: string;
      name?: string;
    },
    amount: number, 
    network: 'testnet' | 'mainnet' = 'testnet'
  ) => {
    // Ensure amount is a valid number with proper decimal handling
    const transferAmount = parseFloat(amount.toFixed(8)); // Limit to 8 decimal places
    if (!isConnected || !address) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    try {
      const walletDisplayName = aaWalletInfo.name || aaWalletInfo.accountId;
      
      console.log(`Transferring ${transferAmount} HBAR to AA Wallet: ${walletDisplayName}`);
      console.log(`AA Wallet Account ID: ${aaWalletInfo.accountId}`);
      console.log(`AA Wallet EVM Address: ${aaWalletInfo.evmAddress}`);
      if (aaWalletInfo.name) {
        console.log(`User Name: ${aaWalletInfo.name}`);
      }

      // Switch to Hedera network first
      const networkSwitched = await switchToHederaNetwork(network);
      if (!networkSwitched) {
        return {
          success: false,
          error: 'Failed to switch to Hedera network'
        };
      }

      // Use EVM address directly for AA wallet transfers (fastest and most reliable)
      const result = await transferHBARViaEVM(aaWalletInfo.evmAddress, transferAmount, address, network);
      
      if (result.success) {
        console.log(`Successfully transferred ${transferAmount} HBAR to AA Wallet ${walletDisplayName}`);
        console.log(`Transaction Hash: ${result.transactionHash}`);
        console.log(`Hashscan URL: ${result.hashscanUrl}`);
      }
      
      return {
        success: result.success,
        transactionHash: result.transactionHash,
        error: result.error,
        hashscanUrl: result.hashscanUrl
      };
    } catch (error) {
      console.error('Error transferring to AA Wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer to AA Wallet failed'
      };
    }
  };

  const contextValue: HederaWalletContextType = {
    transferHBAR,
    transferToAAWallet,
    switchToHederaNetwork,
    processReceipt,
    isConnected,
    address,
    isTransferring
  };

  return (
    <HederaWalletContext.Provider value={contextValue}>
      {children}
    </HederaWalletContext.Provider>
  );
}

// Hook to use Hedera wallet context
export function useHederaWallet() {
  const context = useContext(HederaWalletContext);
  if (context === undefined) {
    throw new Error('useHederaWallet must be used within a HederaWalletProvider');
  }
  return context;
}

const config = getDefaultConfig({
  appName: 'JuryBox',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [hederaTestnet, sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <HederaWalletProvider>
            {children}
          </HederaWalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
