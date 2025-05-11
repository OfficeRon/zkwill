import { NetworkConfig } from '../types/network';

export interface NetworkConfig {
  chainId: string;
  name: string;
  shortName: string;
  rpcUrl: string;
  blockExplorer: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  logoUrl: string;
  contractAddress?: string; // Will contract address for this network
}

// Supported networks with their configurations
export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
  '0x5AFF': {  // Sapphire Testnet Chain ID
    chainId: '0x5AFF',
    name: 'Sapphire Testnet',
    shortName: 'SAPP',
    rpcUrl: 'https://testnet.sapphire.oasis.dev',
    blockExplorer: 'https://testnet.explorer.sapphire.oasis.dev',
    currency: {
      name: 'TEST',
      symbol: 'TEST',
      decimals: 18
    },
    logoUrl: 'https://docs.oasis.dev/img/logo.png',
    // contractAddress: "0x..." // To be added after deployment
  }
};

// Function to check if a network is supported
export const isNetworkSupported = (chainId: string | null): boolean => {
  if (!chainId) return false;
  return chainId in SUPPORTED_NETWORKS;
};

// Function to get network details
export const getNetworkDetails = (chainId: string | null): NetworkConfig | null => {
  if (!chainId || !isNetworkSupported(chainId)) return null;
  return SUPPORTED_NETWORKS[chainId];
}; 