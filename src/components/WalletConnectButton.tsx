import { createAppKit } from '@reown/appkit/react'
// import { CloudAuthSIWX } from '@reown/appkit-siwx'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { useEffect, useRef, useState } from 'react'

// Define Sapphire testnet
const sapphireTestnet = {
  id: 23295,
  name: 'Sapphire Testnet',
  network: 'sapphire-testnet',
  nativeCurrency: {
    name: 'TEST',
    symbol: 'TEST',
    decimals: 18
  },
  rpcUrls: {
    default: { http: ['https://testnet.sapphire.oasis.dev'] },
    public: { http: ['https://testnet.sapphire.oasis.dev'] }
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://testnet.explorer.sapphire.oasis.dev' }
  },
  testnet: true
}

// 1. Get projectId
const projectId = '2217f1bdaf9856078d15617a25f6bb93'

// 2. Create a metadata object
const metadata = {
  name: 'ZK-Will',
  description: 'Zero-Knowledge Will Platform',
  url: window.location.origin,
  icons: [`${window.location.origin}/logo.png`]
}

// 3. Create the AppKit instance outside of the component
// This is needed to register the Web3Modal on page load
createAppKit({
  adapters: [new EthersAdapter()],
  networks: [sapphireTestnet],
  metadata,
  // siwx: new CloudAuthSIWX(),
  projectId,
  features: {
    analytics: true
  }
});

export default function WalletConnectButton() {
  const buttonRef = useRef<HTMLElement | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Directly check if Ethereum provider indicates a connected state
//   const checkEthereumConnection = () => {
//     if (typeof window !== 'undefined' && window.ethereum) {
//       // Check if ethereum provider has accounts
//       window.ethereum.request({ method: 'eth_accounts' })
//         .then((accounts: string[]) => {
//           if (accounts && accounts.length > 0) {
//             console.log('WalletConnectButton: Ethereum provider shows connected account:', accounts[0]);
//             setIsConnected(true);
//             setWalletAddress(accounts[0]);
//             localStorage.setItem('walletConnected', 'true');
//             localStorage.setItem('walletAddress', accounts[0]);
//             document.documentElement.setAttribute('data-wallet-connected', 'true');
            
//             // Dispatch event for other components
//             window.dispatchEvent(new CustomEvent('wallet_connected', { 
//               detail: { address: accounts[0] }
//             }));
            
//             return true;
//           }
//           return false;
//         })
//         .catch(err => {
//           console.error('Error checking ethereum accounts:', err);
//           return false;
//         });
//     }
//     return false;
//   };

  // Function to check connection status
  const checkConnectionStatus = () => {
    // First, try direct Ethereum check (will update state if connected)
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[] | unknown) => {
          const accountsArray = accounts as string[];
          if (accountsArray && accountsArray.length > 0) {
            console.log('WalletConnectButton: Ethereum provider shows connected account:', accountsArray[0]);
            setIsConnected(true);
            setWalletAddress(accountsArray[0]);
            localStorage.setItem('walletConnected', 'true');
            localStorage.setItem('walletAddress', accountsArray[0]);
            document.documentElement.setAttribute('data-wallet-connected', 'true');
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('wallet_connected', { 
              detail: { address: accountsArray[0] }
            }));
            
            return true;
          }
        })
        .catch(err => {
          console.error('Error checking ethereum accounts:', err);
        });
    }
    
    // 1. Check button element attributes if available
    const button = document.querySelector('appkit-button');
    if (button) {
      const buttonConnected = button.hasAttribute('connected') || 
                              button.getAttribute('connected') === 'true';
      
      if (buttonConnected) {
        console.log('WalletConnectButton: Button indicates connected state');
        try {
          // Try to get account info from button
          const accountInfo = button.getAttribute('account');
          if (accountInfo) {
            const parsedInfo = JSON.parse(accountInfo);
            const address = parsedInfo.address;
            if (address) {
              console.log('WalletConnectButton: Found account in button:', address);
              setWalletAddress(address);
              setIsConnected(true);
              localStorage.setItem('walletConnected', 'true');
              localStorage.setItem('walletAddress', address);
              return true;
            }
          }
        } catch (e) {
          console.error('Error parsing account info:', e);
        }
      }
    }
    
    // 2. Check localStorage as fallback
    const savedConnected = localStorage.getItem('walletConnected') === 'true';
    const savedAddress = localStorage.getItem('walletAddress');
    
    if (savedConnected && savedAddress) {
      console.log('WalletConnectButton: Found saved connection in localStorage:', savedAddress);
      setWalletAddress(savedAddress);
      setIsConnected(true);
      return true;
    }
    
    // 3. If we got here, not connected
    setIsConnected(false);
    setWalletAddress(null);
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    return false;
  };

  useEffect(() => {
    console.log('WalletConnectButton: Component mounted');
    
    // Initial connection check
    const isCurrentlyConnected = checkConnectionStatus();
    
    // If connected, dispatch event
    if (isCurrentlyConnected && walletAddress) {
      window.dispatchEvent(new CustomEvent('wallet_connected', { 
        detail: { address: walletAddress }
      }));
    }

    // Find the button element
    const button = document.querySelector('appkit-button');
    buttonRef.current = button;
    
    if (button) {
      // Connection event handler
      const handleConnect = ((event: Event) => {
        const customEvent = event as CustomEvent<{address?: string; account?: string; chainId?: string}>;
        const address = customEvent.detail?.address || customEvent.detail?.account;
        
        console.log('Wallet connected:', address);
        
        if (address) {
          // Update state
          setIsConnected(true);
          setWalletAddress(address);
          
          // Store connection in localStorage for persistence
          localStorage.setItem('walletConnected', 'true');
          localStorage.setItem('walletAddress', address);
          
          // Dispatch global event for any components that need to know about connection
          window.dispatchEvent(new CustomEvent('wallet_connected', { 
            detail: { address, chainId: customEvent.detail?.chainId }
          }));
        }
      }) as EventListener;
      
      // Disconnection handler
      const handleDisconnect = (() => {
        console.log('Wallet disconnected');
        
        // Force disconnection state regardless of any other conditions
        setIsConnected(false);
        setWalletAddress(null);
        
        // Clear all connection indicators
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        document.documentElement.setAttribute('data-wallet-connected', 'false');
        
        // Dispatch global event to ensure all components know about the disconnection
        window.dispatchEvent(new Event('wallet_disconnected'));
      }) as EventListener;
      
      // Add event listeners
      button.addEventListener('connect', handleConnect);
      button.addEventListener('disconnect', handleDisconnect);
      
      // Set up interval to periodically check connection status
      const connectionCheckInterval = setInterval(() => {
        checkConnectionStatus();
      }, 5000); // Check every 5 seconds
      
      // Clean up on unmount
      return () => {
        button.removeEventListener('connect', handleConnect);
        button.removeEventListener('disconnect', handleDisconnect);
        clearInterval(connectionCheckInterval);
      };
    }
  }, [walletAddress]);
  
  // Make connected state available globally through a data attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-wallet-connected', isConnected.toString());
    
    // Also dispatch event when state changes
    if (isConnected && walletAddress) {
      window.dispatchEvent(new CustomEvent('wallet_connected', { 
        detail: { address: walletAddress }
      }));
    } else if (!isConnected) {
      window.dispatchEvent(new Event('wallet_disconnected'));
    }
  }, [isConnected, walletAddress]);

  return <appkit-button /> // Using the appkit web component for wallet connection
}