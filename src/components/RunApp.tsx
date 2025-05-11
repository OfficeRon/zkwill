import { useState, useRef } from 'react';
import { Info, AlertCircle, Upload, Copy, Check } from 'lucide-react';
import MetaMaskConnect from './MetaMaskConnect';

const RunApp = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedSocialMedia, setSelectedSocialMedia] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [willValue, setWillValue] = useState('0.1');
  const [jsonNote, setJsonNote] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [commitments, setCommitments] = useState<any>(null);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [copiedOwner, setCopiedOwner] = useState(false);
  const [copiedHeir, setCopiedHeir] = useState(false);
  const [showTransactionResult, setShowTransactionResult] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionError, setTransactionError] = useState('');

  const handleConnect = (address: string) => {
    setIsConnected(true);
    setWalletAddress(address);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress(null);
  };

  const handleSocialMediaSelect = (platform: string) => {
    setSelectedSocialMedia(platform);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleWillValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWillValue(e.target.value);
  };

  const copyToClipboard = (text: string, type: 'owner' | 'heir') => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    if (type === 'owner') {
      setCopiedOwner(true);
      setTimeout(() => setCopiedOwner(false), 2000);
    } else {
      setCopiedHeir(true);
      setTimeout(() => setCopiedHeir(false), 2000);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSocialMedia) {
      alert('Please select a social media platform first.');
      return;
    }

    if (!username.trim()) {
      alert('Please enter a username.');
      return;
    }

    // Create form data
    const formData = {
      redditUser: username,
      timestamp: Date.now() + (100 * 1000) // 100 seconds in milliseconds
    };

    try {
      console.log("Generating and inserting commitment");
      console.log(formData);
      // Make actual POST request to localhost
      const response = await fetch('http://localhost:3000/generateAndInsertCommitment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the transaction data from the response
      const data = await response.json();
      console.log('Server response:', data);
      
      // Store the commitments for later display
      setCommitments(data);
      
      // Check if we have the transaction data we need
      if (data.transaction) {
        // Initiate the transaction using window.ethereum
        if (window.ethereum && isConnected) {
          try {
            // Format transaction parameters
            const transactionParameters = {
              to: data.transaction.to, // Contract address from server
              from: walletAddress, // User's address
              value: "0x" + parseInt(data.transaction.value).toString(16), // Convert decimal to hex
              data: data.transaction.data, // Transaction data (hex encoded function call)
            };
            
            // Send the transaction
            const txHash = await window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [transactionParameters],
            });
            
            console.log('Transaction sent:', txHash);
            
            // Show the commitment modal instead of the alert
            setShowCommitmentModal(true);
            // Store transaction hash for potential future use
            setTransactionHash(txHash);
          } catch (error) {
            console.error('Transaction error:', error);
            // Display transaction error modal instead of alert
            setTransactionSuccess(false);
            setTransactionError(error instanceof Error ? error.message : 'Unknown error occurred');
            setShowTransactionResult(true);
          }
        } else {
          // Display transaction error modal instead of alert
          setTransactionSuccess(false);
          setTransactionError('Wallet not connected or ethereum provider not available.');
          setShowTransactionResult(true);
        }
      } else {
        console.log('Will created:', formData);
        // Display transaction error modal instead of alert
        setTransactionSuccess(false);
        setTransactionError('Will created successfully, but no transaction data was returned from the server.');
        setShowTransactionResult(true);
      }
      
      // Reset the form
      setSelectedSocialMedia(null);
      setUsername('');
      setWillValue('0.1');
    } catch (error) {
      console.error('Error creating will:', error);
      // Display transaction error modal instead of alert
      setTransactionSuccess(false);
      setTransactionError('Error creating will. Backend server may not be running yet.');
      setShowTransactionResult(true);
    }
  };

  const handleClaim = async () => {
    if (!jsonNote.trim()) {
      alert('Please enter the JSON note.');
      return;
    }

    try {
      // Validate JSON
      const parsedJson = JSON.parse(jsonNote);
      console.log(parsedJson.secret, parsedJson.nullifier, parsedJson.inputTimestamp)
      // Validate required fields
      // if (!parsedJson.secret || !parsedJson.nullifier || !parsedJson.inputTimestamp) {
      //   alert('JSON must include commitment, nullifier, and timestamp fields.');
      //   return;
      // }

      // Make POST request to claim endpoint
      const response = await fetch('http://localhost:3000/generateProof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preimage: parsedJson
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Claim response:', data);
      
      // Check if the response contains transaction data for a successful verification
      if (data.success && data.transaction) {
        // Prompt the wallet to send the transaction
        if (window.ethereum && isConnected) {
          try {
            // Format transaction parameters
            const transactionParameters = {
              to: data.transaction.to, // Contract address from server
              from: walletAddress, // User's address
              value: data.transaction.value === "0" ? "0x0" : "0x" + parseInt(data.transaction.value).toString(16), // Convert value to hex
              data: data.transaction.data, // Transaction data (hex encoded function call)
            };
            
            // Send the transaction
            const txHash = await window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [transactionParameters],
            });
            
            console.log('Transaction sent:', txHash);
            // Show success transaction modal
            setTransactionSuccess(true);
            setTransactionHash(txHash);
            setShowTransactionResult(true);
          } catch (error) {
            console.error('Transaction error:', error);
            // Show error transaction modal
            setTransactionSuccess(false);
            setTransactionError(error instanceof Error ? error.message : 'Unknown error occurred');
            setShowTransactionResult(true);
          }
        } else {
          // Show error transaction modal
          setTransactionSuccess(false);
          setTransactionError('Wallet not connected or ethereum provider not available.');
          setShowTransactionResult(true);
        }
      } else if (data.success === false && data.error) {
        // Handle specific error cases
        setTransactionSuccess(false);
        if (data.error === "Not yet expired") {
          setTransactionError(`Will cannot be executed yet. It will expire on: ${data.expiryDate}`);
        } else {
          setTransactionError(`Error: ${data.error}`);
        }
        setShowTransactionResult(true);
      } else {
        // Show error transaction modal
        setTransactionSuccess(false);
        setTransactionError('Claim submitted successfully, but no transaction data was returned.');
        setShowTransactionResult(true);
      }
      
      // Reset the form
      setJsonNote('');
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Show error transaction modal
        setTransactionSuccess(false);
        setTransactionError('Invalid JSON format. Please check your JSON note.');
        setShowTransactionResult(true);
      } else {
        console.error('Error submitting claim:', error);
        // Show error transaction modal
        setTransactionSuccess(false);
        setTransactionError('Error submitting claim. Backend server may not be running yet.');
        setShowTransactionResult(true);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="flex border-b border-[#2a2a2a]">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === 'create' ? 'bg-[#a3ffae] text-black' : 'bg-[#1a1a1a] text-white hover:bg-[#232323]'
            } transition-colors`}
            onClick={() => setActiveTab('create')}
          >
            Create Will
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === 'execute' ? 'bg-[#a3ffae] text-black' : 'bg-[#1a1a1a] text-white hover:bg-[#232323]'
            } transition-colors`}
            onClick={() => setActiveTab('execute')}
          >
            Execute Will
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'create' ? (
            <div className="mb-6">
              <div className="mb-6">
                <label className="block text-white mb-2 font-medium">Select Social Media Platform</label>
                <div className="grid grid-cols-5 gap-3">
                  {['Reddit', 'Instagram', 'Facebook', 'Bluesky', 'X'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => handleSocialMediaSelect(platform)}
                      className={`py-2 px-3 rounded-md flex items-center justify-center ${
                        selectedSocialMedia === platform
                          ? 'bg-[#a3ffae] text-black font-medium'
                          : 'bg-[#1a1a1a] text-white hover:bg-[#232323]'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white mb-2 font-medium">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Enter username"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#a3ffae] focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-white mb-2 font-medium">Will Value</label>
                <select
                  value={willValue}
                  onChange={handleWillValueChange}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#a3ffae] focus:border-transparent"
                >
                  <option value="0.1">0.1 ETH</option>
                  <option value="1">1 ETH</option>
                  <option value="10">10 ETH</option>
                </select>
              </div>

              <div className="flex flex-col space-y-3 mt-4">
                {!isConnected ? (
                  <MetaMaskConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="w-full py-3 px-4 bg-[#a3ffae] text-black rounded-md font-medium hover:bg-[#7aff85] transition-colors"
                  >
                    Create Secure Will
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2 font-medium">JSON Note</label>
                <textarea
                  value={jsonNote}
                  onChange={(e) => setJsonNote(e.target.value)}
                  placeholder='{
  "commitment": "",
  "nullifier": "",
  "timestamp": ""
}'
                  className="w-full h-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#a3ffae] focus:border-transparent resize-none font-mono"
                />
                <p className="mt-2 text-sm text-gray-400">
                  Enter your claim details in JSON format with commitment, nullifier, and timestamp.
                </p>
                {!isConnected ? (
                  <MetaMaskConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />
                ) : (
                  <button
                    onClick={handleClaim}
                    className="w-full mt-4 py-3 px-4 bg-[#a3ffae] text-black rounded-md font-medium hover:bg-[#7aff85] transition-colors"
                  >
                    Execute Will
                  </button>
                )}
              </div>
            </div>
          )}

          {isConnected && walletAddress && (
            <div className="mt-4 p-3 bg-[#232323] rounded-md text-sm text-gray-300 flex items-start">
              <AlertCircle className="h-5 w-5 text-[#a3ffae] mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Connected to wallet</p>
                <p className="truncate">{walletAddress}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="flex border-b border-[#2a2a2a]">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${
              showStatistics ? 'bg-[#a3ffae] text-black' : 'bg-[#1a1a1a] text-white hover:bg-[#232323]'
            } transition-colors`}
            onClick={() => setShowStatistics(true)}
          >
            Statistics
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${
              !showStatistics ? 'bg-[#a3ffae] text-black' : 'bg-[#1a1a1a] text-white hover:bg-[#232323]'
            } transition-colors`}
            onClick={() => setShowStatistics(false)}
          >
            How It Works
          </button>
        </div>

        {showStatistics ? (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">Privacy set</span>
                <span className="inline-flex items-center bg-[#1a1a1a] px-2 py-1 rounded text-sm text-[#a3ffae]">
                  <span className="mr-1">1</span>
                </span>
              </div>
              
              <div className="mb-4">
                <div className="text-2xl font-bold text-white">12,479</div>
                <div className="text-sm text-gray-400">secure wills created</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <div className="text-xl font-bold text-white">8,245</div>
                  <div className="text-sm text-gray-400">active wills</div>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <div className="text-xl font-bold text-white">4,234</div>
                  <div className="text-sm text-gray-400">executed wills</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-3">Latest activity</h3>
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-md">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-[#a3ffae] mr-2"></div>
                      <span className="text-sm text-white">Will #{12479 - i}</span>
                    </div>
                    <span className="text-xs text-gray-400">{i * 7 + 2} minutes ago</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-[#a3ffae] mb-2">How ZK-Will Works</h3>
                <p className="text-gray-300 text-sm">
                  ZK-Will uses zero-knowledge proofs to create secure, private digital wills. Your will's contents remain completely encrypted and private until execution conditions are met.
                </p>
              </div>
              
              <div className="bg-[#1a1a1a] p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Create a Will</h4>
                <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                  <li>Connect your wallet</li>
                  <li>Write your will content</li>
                  <li>Create your secure will</li>
                  <li>Receive a unique Will ID</li>
                </ol>
              </div>
              
              <div className="bg-[#1a1a1a] p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Execute a Will</h4>
                <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                  <li>Connect your wallet</li>
                  <li>Enter your Will ID</li>
                  <li>Verify your identity with zero-knowledge proof</li>
                  <li>Execute the will</li>
                </ol>
              </div>
              
              <div className="flex items-start p-3 bg-[#232323] rounded-md text-sm">
                <Info className="h-5 w-5 text-[#a3ffae] mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  All operations use zero-knowledge proofs to ensure maximum privacy and security. No one, not even us, can see the contents of your will.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showTransactionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 max-w-md w-full">
            {transactionSuccess ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#a3ffae] bg-opacity-20 mb-4">
                  <Check className="h-8 w-8 text-[#a3ffae]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Transaction Successful!</h2>
                <p className="text-gray-300 text-sm mb-4">
                  Your transaction has been successfully submitted to the blockchain.
                </p>
                {transactionHash && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">Transaction Hash:</p>
                    <div className="bg-[#1a1a1a] p-3 rounded-md flex items-center justify-between">
                      <p className="text-xs text-gray-300 truncate">{transactionHash}</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(transactionHash);
                          const button = document.activeElement as HTMLButtonElement;
                          if (button) {
                            const originalText = button.innerHTML;
                            button.innerHTML = 'Copied!';
                            setTimeout(() => {
                              button.innerHTML = originalText;
                            }, 2000);
                          }
                        }}
                        className="ml-2 text-xs bg-[#232323] hover:bg-[#2a2a2a] text-white py-1 px-2 rounded flex items-center"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setShowTransactionResult(false)}
                  className="py-2 px-4 bg-[#a3ffae] text-black rounded-md font-medium hover:bg-[#7aff85] transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500 bg-opacity-20 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Transaction Failed</h2>
                <p className="text-gray-300 text-sm mb-4">
                  {transactionError || 'There was an error processing your transaction.'}
                </p>
                <button
                  onClick={() => setShowTransactionResult(false)}
                  className="py-2 px-4 bg-[#a3ffae] text-black rounded-md font-medium hover:bg-[#7aff85] transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showCommitmentModal && commitments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Your Will Was Created Successfully!</h2>
            
            <div className="bg-[#232323] p-4 rounded-md mb-6 border-l-4 border-[#a3ffae]">
              <p className="text-white text-sm mb-2 font-bold">⚠️ IMPORTANT: SAVE THESE SECRETS!</p>
              <p className="text-gray-300 text-sm">
                These commitment details are crucial for accessing your will. Store them securely and privately.
                You MUST keep these safe - they cannot be recovered if lost!
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-medium">Owner's Commitment</h3>
                <button 
                  onClick={() => copyToClipboard(commitments.owner, 'owner')}
                  className="flex items-center text-xs bg-[#1a1a1a] hover:bg-[#232323] text-white py-1 px-3 rounded"
                >
                  {copiedOwner ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-[#a3ffae]" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-[#1a1a1a] p-3 rounded-md overflow-x-auto">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(commitments.owner, null, 2)}
                </pre>
              </div>
              <p className="text-xs text-gray-400 mt-1">Use this to manage your will.</p>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-medium">Heir's Commitment</h3>
                <button 
                  onClick={() => copyToClipboard(commitments.heir, 'heir')}
                  className="flex items-center text-xs bg-[#1a1a1a] hover:bg-[#232323] text-white py-1 px-3 rounded"
                >
                  {copiedHeir ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-[#a3ffae]" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-[#1a1a1a] p-3 rounded-md overflow-x-auto">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(commitments.heir, null, 2)}
                </pre>
              </div>
              <p className="text-xs text-gray-400 mt-1">Share this with your heir (the beneficiary).</p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowCommitmentModal(false)}
                className="py-2 px-4 bg-[#a3ffae] text-black rounded-md font-medium hover:bg-[#7aff85] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunApp;