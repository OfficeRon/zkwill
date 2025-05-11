import React, { useState, useEffect, useRef } from 'react';
import { Shield, LogOut, CheckCircle, AlertOctagon, ChevronDown } from 'lucide-react';
import {
  isMetaMaskInstalled,
  connectMetaMask,
  getCurrentAccount,
  shortenAddress,
  getAvatarUrl,
  setupAccountChangeListener,
  setupChainChangeListener,
  switchToNetwork,
} from '../utils/metamask';
import { SUPPORTED_NETWORKS, isNetworkSupported, getNetworkDetails } from '../config/networks';

interface MetaMaskConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  minimal?: boolean;
}

const MetaMaskConnect: React.FC<MetaMaskConnectProps> = ({ onConnect, onDisconnect, minimal = false }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangingNetwork, setIsChangingNetwork] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Check if MetaMask is installed and get initial account on mount
  useEffect(() => {
    const checkMetaMask = async () => {
      if (!isMetaMaskInstalled()) {
        setError('MetaMask is not installed');
        return;
      }

      try {
        // Get current account if already connected
        const currentAccount = await getCurrentAccount();
        if (currentAccount) {
          setAccount(currentAccount);
          onConnect?.(currentAccount);

          // Get current chain ID
          if (window.ethereum) {
            const networkVersion = await window.ethereum.request({ method: 'eth_chainId' });
            // Cast the unknown to string as we know eth_chainId returns a hex string
            const chainIdString = typeof networkVersion === 'string' ? networkVersion : null;
            setChainId(chainIdString);
          }
        }
      } catch (err) {
        console.error('Error checking MetaMask connection:', err);
      }
    };

    checkMetaMask();
  }, [onConnect]);

  // Set up listeners for account and chain changes
  useEffect(() => {
    const accountCleanup = setupAccountChangeListener((newAccount) => {
      setAccount(newAccount);
      if (newAccount) {
        onConnect?.(newAccount);
      } else {
        handleDisconnect();
      }
    });

    const chainCleanup = setupChainChangeListener((newChainId) => {
      setChainId(newChainId);
    });

    return () => {
      accountCleanup();
      chainCleanup();
    };
  }, [onConnect, onDisconnect]);

  // Handle clicks outside the user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!isMetaMaskInstalled()) {
        setError('Please install MetaMask to connect');
        return;
      }

      const address = await connectMetaMask();
      if (address) {
        setAccount(address);
        onConnect?.(address);

        // Get chain ID after connecting
        if (window.ethereum) {
          const networkVersion = await window.ethereum.request({ method: 'eth_chainId' });
          // Type assertion since we know the return type
          const chainIdString = typeof networkVersion === 'string' ? networkVersion : null;
          setChainId(chainIdString);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to MetaMask';
      setError(errorMessage);
      console.error('Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchNetwork = async (targetChainId: string) => {
    setIsChangingNetwork(true);
    setError(null);
    setIsNetworkMenuOpen(false);

    try {
      await switchToNetwork(targetChainId);
      setChainId(targetChainId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch network';
      setError(errorMessage);
      console.error('Network switch error:', err);
    } finally {
      setIsChangingNetwork(false);
    }
  };

  const handleDisconnect = () => {
    // Reset UI state
    setAccount(null);
    setChainId(null);
    setIsUserMenuOpen(false);
    onDisconnect?.();
  };

  // Get network details
  const networkDetails = getNetworkDetails(chainId);
  const isOnSupportedNetwork = isNetworkSupported(chainId);

  // If minimal view is requested (for navbar), render a simplified version
  if (minimal && account) {
    return (
      <div className="flex items-center gap-2" ref={userMenuRef}>
        <div className="relative">
          {/* Account display button that toggles dropdown */}
          <button
            className={`flex items-center px-3 py-1.5 ${
              isOnSupportedNetwork ? 'bg-[#232323]' : 'bg-[#3a2323]'
            } rounded-md text-sm hover:bg-opacity-80 transition-colors`}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <img 
              src={getAvatarUrl(account)} 
              alt="Wallet Avatar" 
              className="h-4 w-4 rounded-full mr-2" 
            />
            <span className="text-white mr-1">{shortenAddress(account)}</span>
            <ChevronDown className="h-3 w-3 text-gray-400 ml-1" />
            
            {networkDetails ? (
              <div className="flex items-center">
                <span className="text-gray-400 mx-1">|</span>
                <div className="w-3 h-3 rounded-full overflow-hidden mr-1 bg-white flex items-center justify-center">
                  <img 
                    src={networkDetails.logoUrl} 
                    alt={networkDetails.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNpcmNsZS1kb3QiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMSIvPjwvc3ZnPg==';
                    }}
                  />
                </div>
                <span className={isOnSupportedNetwork ? 'text-[#a3ffae]' : 'text-yellow-400'}>
                  {networkDetails.shortName}
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="text-gray-400 mx-1">|</span>
                <span className="text-red-400">Unknown Network</span>
              </div>
            )}
          </button>
          
          {/* Dropdown menu when the user clicks on the account */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg z-10 min-w-[180px]">
              <div className="py-1">
                <button
                  onClick={handleDisconnect}
                  className="w-full px-4 py-2 text-left flex items-center text-white hover:bg-[#242424]"
                >
                  <LogOut className="h-4 w-4 mr-2 text-red-400" />
                  <span>Disconnect Wallet</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isMetaMaskInstalled() && !account) {
    return (
      <div className="flex flex-col space-y-2">
        <a 
          href="https://metamask.io/download.html" 
          target="_blank" 
          rel="noopener noreferrer"
          className="py-3 px-4 bg-[#E86A33] text-white rounded-md font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
        >
          <AlertOctagon className="mr-2 h-5 w-5" />
          Install MetaMask
        </a>
        {error && (
          <div className="text-sm text-red-400">{error}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {!account ? (
        // Connect button
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="py-3 px-4 bg-[#a3ffae] text-black rounded-md font-medium hover:bg-[#7aff85] transition-colors flex items-center justify-center"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
              Connecting...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-5 w-5" />
              Connect MetaMask
            </>
          )}
        </button>
      ) : (
        // Connected state with improved network selection - more similar to the screenshot
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <img 
                src={getAvatarUrl(account)} 
                alt="Wallet Avatar" 
                className="h-6 w-6 rounded-full mr-2" 
              />
              <span className="font-medium text-[#a3ffae]">{shortenAddress(account)}</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="text-gray-400 hover:text-white transition-colors"
              title="Disconnect"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          
          {/* Network selector - styled like the image provided */}
          <div className="relative">
            <button
              onClick={() => setIsNetworkMenuOpen(!isNetworkMenuOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-full ${
                isOnSupportedNetwork 
                  ? 'bg-[#1e1e1e] border border-[#333333]' 
                  : 'bg-[#3a2323] border border-[#4d3434]'
              }`}
            >
              <div className="flex items-center">
                {networkDetails ? (
                  <>
                    <div className="w-5 h-5 mr-2 rounded-full overflow-hidden bg-white flex items-center justify-center">
                      <img 
                        src={networkDetails.logoUrl} 
                        alt={networkDetails.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback for missing network logo
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNpcmNsZS1kb3QiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMSIvPjwvc3ZnPg==';
                        }}
                      />
                    </div>
                    <span className="text-sm text-white">{networkDetails.name}</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 mr-2 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-xs">?</div>
                    <span className="text-sm text-white">
                      {chainId ? `Unknown Network (${chainId})` : 'Unknown Network'}
                    </span>
                  </>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isNetworkMenuOpen ? 'transform rotate-180' : ''}`} />
            </button>
            
            {/* Network dropdown menu */}
            {isNetworkMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg z-10 max-h-52 overflow-auto">
                <div className="py-1">
                  {Object.values(SUPPORTED_NETWORKS).map((network) => (
                    <button
                      key={network.chainId}
                      onClick={() => handleSwitchNetwork(network.chainId)}
                      disabled={isChangingNetwork || network.chainId === chainId}
                      className={`w-full px-3 py-2 text-left flex items-center hover:bg-[#242424] ${
                        network.chainId === chainId 
                          ? 'bg-[#242424] text-[#a3ffae]' 
                          : 'text-white'
                      }`}
                    >
                      <div className="w-5 h-5 mr-2 rounded-full overflow-hidden bg-white flex items-center justify-center">
                        <img 
                          src={network.logoUrl} 
                          alt={network.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNpcmNsZS1kb3QiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMSIvPjwvc3ZnPg==';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{network.name}</div>
                        <div className="text-xs text-gray-400">{network.shortName}</div>
                      </div>
                      {network.chainId === chainId && (
                        <CheckCircle className="h-4 w-4 text-[#a3ffae] ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Status connected chip - resembles the screenshot you shared */}
          <div className="flex justify-center mt-3">
            <div className="flex items-center px-3 py-1 bg-[#232323] rounded-md text-[#a3ffae] text-sm">
              <span className="mr-2">●</span> Connected
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-400 bg-red-900 bg-opacity-20 p-2 rounded">{error}</div>
      )}
    </div>
  );
};

export default MetaMaskConnect; 