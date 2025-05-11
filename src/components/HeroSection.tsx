import React, { useState } from 'react';
import { ArrowRight, Lock, Shield, ChevronDown, Info } from 'lucide-react';
import RunApp from './RunApp';

const HeroSection = () => {
  const [showRunApp, setShowRunApp] = useState(false);

  return (
    <div className="relative overflow-hidden bg-[#121212] py-24 sm:py-32">
      {/* Background circuit pattern */}
      <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Secure Your Legacy with <span className="text-[#a3ffae]">Zero-Knowledge</span> Technology
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Ensure your final wishes remain private and tamper-proof through state-of-the-art zero-knowledge proofs.
            Our platform provides unparalleled security and privacy for your digital will.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={() => setShowRunApp(!showRunApp)}
              className="rounded-md bg-[#a3ffae] px-6 py-3 text-sm font-semibold text-black shadow-sm hover:bg-[#7aff85] transition-colors flex items-center"
            >
              {showRunApp ? "Hide Interface" : "Get Started"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <a href="#how-it-works" className="text-sm font-semibold leading-6 text-white hover:text-[#a3ffae] transition-colors">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        
        {!showRunApp ? (
          <div className="mt-16 flow-root">
            <div className="relative rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-8 shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="inline-flex items-center rounded-full bg-[#a3ffae] px-4 py-1 text-xs font-medium text-black">
                  <Lock className="mr-1 h-3 w-3" />
                  Secure & Private
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-[#232323] hover:bg-[#2a2a2a] transition-colors">
                  <div className="text-[#a3ffae] text-4xl font-bold">100%</div>
                  <div className="mt-2 text-sm text-gray-300">Privacy Guaranteed</div>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-[#232323] hover:bg-[#2a2a2a] transition-colors">
                  <div className="text-[#a3ffae] text-4xl font-bold">ZK</div>
                  <div className="mt-2 text-sm text-gray-300">Zero-Knowledge Proofs</div>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-[#232323] hover:bg-[#2a2a2a] transition-colors">
                  <div className="text-[#a3ffae] text-4xl font-bold">24/7</div>
                  <div className="mt-2 text-sm text-gray-300">Tamper-Proof Security</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-16">
            <RunApp />
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;