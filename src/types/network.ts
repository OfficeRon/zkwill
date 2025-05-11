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
  contractAddress?: string;
} 