import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define interface for AppKit button element
interface AppKitButtonElement extends HTMLElement {
  // Define methods that can be called on the AppKit button
  // Using methods with a different name from the HTMLElement properties
  checkConnection?: () => Promise<boolean>;
  disconnect?: () => Promise<void> | void;
  getAccounts?: () => Promise<string[]>;
  // AppKit button has a click method we can call
  click: () => void;
}

interface WalletContextType {
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize connection state from localStorage and DOM attribute
  useEffect(() => {
    // Check the DOM data attribute (most reliable, set by WalletConnectButton)
    const isConnectedFromDOM = document.documentElement.getAttribute('data-wallet-connected') === 'true';
    
    if (isConnectedFromDOM) {
      console.log('WalletContext: Connection detected from DOM attribute');
      const savedAddress = localStorage.getItem('walletAddress');
      if (savedAddress) {
        setAccount(savedAddress);
      }
    } else {
      // Fallback to localStorage check
      const savedConnected = localStorage.getItem('walletConnected') === 'true';
      const savedAddress = localStorage.getItem('walletAddress');
      
      if (savedConnected && savedAddress) {
        console.log('WalletContext: Using saved connection from localStorage:', savedAddress);
        setAccount(savedAddress);
      }
    }
  }, []);

  // Listen for window-level connection events
  useEffect(() => {
    // Connection event handler
    const handleConnect = (event: Event) => {
      const customEvent = event as CustomEvent<{address?: string; chainId?: string}>;
      const address = customEvent.detail?.address;
      if (address) {
        console.log('WalletContext: Detected connection event with address:', address);
        setAccount(address);
        setChainId(customEvent.detail?.chainId ? Number(customEvent.detail.chainId) : null);
        
        // Set the DOM attribute
        document.documentElement.setAttribute('data-wallet-connected', 'true');
      }
    };
    
    // Disconnection event handler
    const handleDisconnect = () => {
      console.log('WalletContext: Detected disconnection event');
      
      // In case of disconnection event, always force disconnect state
      // This ensures the user is properly disconnected even if there might be
      // residual connections in ethereum provider
      setAccount(null);
      setChainId(null);
      document.documentElement.setAttribute('data-wallet-connected', 'false');
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
    };
    
    // Register event listeners
    window.addEventListener('wallet_connected', handleConnect);
    window.addEventListener('wallet_disconnected', handleDisconnect);
    
    // Find the appkit-button and add direct event listeners as backup
    const setupDirectListeners = () => {
      const appkitElement = document.querySelector('appkit-button') as AppKitButtonElement;
      if (appkitElement) {
        // Handle direct connect event
        const handleDirectConnect = ((event: Event) => {
          const customEvent = event as CustomEvent<{address?: string; account?: string; chainId?: string}>;
          const address = customEvent.detail?.address || customEvent.detail?.account;
          if (address) {
            console.log('WalletContext: Direct appkit connection event with address:', address);
            setAccount(address);
            setChainId(customEvent.detail?.chainId ? Number(customEvent.detail.chainId) : null);
            // Set the DOM attribute and localStorage
            document.documentElement.setAttribute('data-wallet-connected', 'true');
            localStorage.setItem('walletConnected', 'true');
            localStorage.setItem('walletAddress', address);
          }
        }) as EventListener;
        
        // Handle direct disconnect event
        const handleDirectDisconnect = (() => {
          console.log('WalletContext: Direct appkit disconnection event');
          
          // Force disconnection state regardless of any ethereum provider state
          setAccount(null);
          setChainId(null);
          document.documentElement.setAttribute('data-wallet-connected', 'false');
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('walletAddress');
        }) as EventListener;
        
        // Register direct event listeners
        appkitElement.addEventListener('connect', handleDirectConnect);
        appkitElement.addEventListener('disconnect', handleDirectDisconnect);
        
        // Return cleanup function
        return () => {
          appkitElement.removeEventListener('connect', handleDirectConnect);
          appkitElement.removeEventListener('disconnect', handleDirectDisconnect);
        };
      }
      return undefined;
    };
    
    // Set up direct listeners after a short delay
    const timeoutId = setTimeout(setupDirectListeners, 500);
    
    // Cleanup function
    return () => {
      window.removeEventListener('wallet_connected', handleConnect);
      window.removeEventListener('wallet_disconnected', handleDisconnect);
      clearTimeout(timeoutId);
    };
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);

    try {
      const appkitElement = document.querySelector('appkit-button') as AppKitButtonElement;
      if (appkitElement) {
        // Trigger click on the appkit-button to open the wallet modal
        appkitElement.click();
        
        // Set up a connection detection listener
        const connectionListener = (e: Event) => {
          const customEvent = e as CustomEvent<{address?: string}>;
          if (customEvent.detail?.address) {
            console.log('WalletContext: Detected connection via event listener:', customEvent.detail.address);
            setAccount(customEvent.detail.address);
            document.documentElement.setAttribute('data-wallet-connected', 'true');
          }
        };
        
        // Listen for connection events
        window.addEventListener('wallet_connected', connectionListener);
        
        // Clean up after 5 seconds or when connection is detected
        setTimeout(() => {
          window.removeEventListener('wallet_connected', connectionListener);
        }, 5000);
      } else {
        throw new Error('AppKit button not found');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    try {
      const appkitElement = document.querySelector('appkit-button') as AppKitButtonElement;
      if (appkitElement && appkitElement.disconnect) {
        // Call the disconnect method if available
        appkitElement.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
    
    // Reset state
    setAccount(null);
    setChainId(null);
    
    // Update DOM data attribute
    document.documentElement.setAttribute('data-wallet-connected', 'false');
    
    // Clear localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        isConnecting,
        connectWallet,
        disconnectWallet,
        isConnected: !!account
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 