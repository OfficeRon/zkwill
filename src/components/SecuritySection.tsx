import React from 'react';

const SecuritySection = () => {
  return (
    <div id="security" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Security & Trust</h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Our platform is built on cutting-edge cryptographic principles to ensure maximum security and privacy.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 h-full">
              <h3 className="text-2xl font-semibold text-white mb-6">Zero-Knowledge Technology</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-[#a3ffae] mb-2">What are Zero-Knowledge Proofs?</h4>
                  <p className="text-gray-300">
                    Zero-knowledge proofs allow one party (the prover) to prove to another party (the verifier) that a statement is true without revealing any information beyond the validity of the statement itself.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-[#a3ffae] mb-2">How We Use ZK Proofs</h4>
                  <p className="text-gray-300">
                    Our platform uses ZK proofs to verify the existence and validity of your will without revealing its contents. This ensures that your private information remains confidential until the appropriate time.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-[#a3ffae] mb-2">Technical Implementation</h4>
                  <p className="text-gray-300">
                    We implement zk-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge) to create cryptographic proofs that can be verified without interaction between the prover and verifier.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-[#232323] rounded-lg">
                <div className="text-sm font-mono text-gray-400 overflow-x-auto">
                  <div className="mb-2 text-[#a3ffae]">// Example of ZK-Will verification (simplified)</div>
                  <div><span className="text-blue-400">function</span> <span className="text-yellow-400">verifyWill</span>(publicInputs, proof) {'{'}</div>
                  <div className="pl-4"><span className="text-blue-400">const</span> verified = zkVerifier.verify(publicInputs, proof);</div>
                  <div className="pl-4"><span className="text-blue-400">return</span> verified; <span className="text-gray-500">// True if valid, without revealing will contents</span></div>
                  <div>{'}'}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Security Audits</h3>
              <p className="text-gray-300 mb-4">
                Our protocol has undergone rigorous security audits by leading cryptography experts.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Last audit:</span>
                <span className="text-[#a3ffae]">June 2025</span>
              </div>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Privacy Guarantees</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-[#a3ffae] flex items-center justify-center text-black text-xs mr-2 mt-0.5">✓</div>
                  <span>End-to-end encryption</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-[#a3ffae] flex items-center justify-center text-black text-xs mr-2 mt-0.5">✓</div>
                  <span>No plaintext storage</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-[#a3ffae] flex items-center justify-center text-black text-xs mr-2 mt-0.5">✓</div>
                  <span>Decentralized verification</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-[#a3ffae] flex items-center justify-center text-black text-xs mr-2 mt-0.5">✓</div>
                  <span>Selective disclosure controls</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;