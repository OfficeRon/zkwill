import { SUPPORTED_NETWORKS } from '../config/networks';

// Network configuration for Polygon
export const POLYGON_CHAIN_ID = '0x89'; // 137 in decimal
export const POLYGON_NETWORK_PARAMS = {
  chainId: POLYGON_CHAIN_ID,
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'Polygon',
    symbol: 'POL',
    decimals: 18
  },
  rpcUrls: ['https://polygon-rpc.com/'],
  blockExplorerUrls: ['https://polygonscan.com/']
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Request connection to MetaMask
export const connectMetaMask = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access
    const accounts = await window.ethereum!.request({ method: 'eth_requestAccounts' }) as string[];
    return accounts[0] || null;
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
};

// Get current account
export const getCurrentAccount = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) return null;

  try {
    const accounts = await window.ethereum!.request({ method: 'eth_accounts' }) as string[];
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

// Switch to any supported network
export const switchToNetwork = async (chainId: string): Promise<boolean> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  if (!SUPPORTED_NETWORKS[chainId]) {
    throw new Error('Unsupported network');
  }

  try {
    // Try to switch to the selected network
    await window.ethereum!.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
    return true;
  } catch (error) {
    // This error code means the chain has not been added to MetaMask
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 4902) {
      try {
        const network = SUPPORTED_NETWORKS[chainId];
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: network.chainId,
            chainName: network.name,
            nativeCurrency: network.currency,
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: [network.blockExplorer]
          }],
        });
        return true;
      } catch (addError) {
        console.error(`Error adding ${SUPPORTED_NETWORKS[chainId].name} network to MetaMask:`, addError);
        throw addError;
      }
    } else {
      console.error(`Error switching to ${SUPPORTED_NETWORKS[chainId].name} network:`, error);
      throw error;
    }
  }
};

// Format address to shortened version
export const shortenAddress = (address: string): string => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Get avatar URL based on address
export const getAvatarUrl = (address: string): string => {
  // Using DiceBear for the avatar
  return `https://avatars.dicebear.com/api/identicon/${address}.svg`;
};

// Listen for account changes
export const setupAccountChangeListener = (callback: (account: string | null) => void): () => void => {
  if (!isMetaMaskInstalled()) return () => {};

  const handleAccountsChanged = (accounts: unknown) => {
    const accountsArray = Array.isArray(accounts) ? accounts : [];
    callback(accountsArray[0] || null);
  };

  try {
    window.ethereum!.on('accountsChanged', handleAccountsChanged);
  } catch (err) {
    console.error('Error setting up account change listener:', err);
  }
  
  // Return cleanup function - using try/catch to prevent runtime errors
  return () => {
    try {
      // Try all known methods to remove the listener
      if (window.ethereum) {
        // Store the original ethereum reference
        const ethereum = window.ethereum;
        
        // Try different ways to unsubscribe, catching any errors
        try {
          if (typeof ethereum.removeListener === 'function') {
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
            return;
          }
        } catch (e) {
          console.warn('Error using removeListener:', e);
        }
        
        try {
          if (typeof ethereum.off === 'function') {
            ethereum.off('accountsChanged', handleAccountsChanged);
            return;
          }
        } catch (e) {
          console.warn('Error using off:', e);
        }
        
        console.warn('No suitable method found to remove event listener');
      }
    } catch (err) {
      console.warn('Failed to clean up account change listener:', err);
    }
  };
};

// Listen for chain changes
export const setupChainChangeListener = (callback: (chainId: string) => void): () => void => {
  if (!isMetaMaskInstalled()) return () => {};

  const handleChainChanged = (chainId: unknown) => {
    if (typeof chainId === 'string') {
      callback(chainId);
    }
  };

  try {
    window.ethereum!.on('chainChanged', handleChainChanged);
  } catch (err) {
    console.error('Error setting up chain change listener:', err);
  }
  
  // Return cleanup function - using try/catch to prevent runtime errors
  return () => {
    try {
      // Try all known methods to remove the listener
      if (window.ethereum) {
        // Store the original ethereum reference
        const ethereum = window.ethereum;
        
        // Try different ways to unsubscribe, catching any errors
        try {
          if (typeof ethereum.removeListener === 'function') {
            ethereum.removeListener('chainChanged', handleChainChanged);
            return;
          }
        } catch (e) {
          console.warn('Error using removeListener:', e);
        }
        
        try {
          if (typeof ethereum.off === 'function') {
            ethereum.off('chainChanged', handleChainChanged);
            return;
          }
        } catch (e) {
          console.warn('Error using off:', e);
        }
        
        console.warn('No suitable method found to remove event listener');
      }
    } catch (err) {
      console.warn('Failed to clean up chain change listener:', err);
    }
  };
}; 