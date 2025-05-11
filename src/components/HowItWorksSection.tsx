import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(1);
  
  const steps = [
    {
      number: 1,
      title: "Create Your Will",
      description: "Set up your digital will with social media activity verification.",
      details: "Create your will by connecting your wallet and specifying your social media account for activity verification. The system will generate unique cryptographic commitments that serve as proof of will creation while keeping the details private."
    },
    {
      number: 2,
      title: "ROFL Activity Verification",
      description: "Automated proof-of-life through social media activity monitoring.",
      details: "Our system uses ROFL (Remote Oasis Facility Layer) to monitor your social media activity in a privacy-preserving way. Running in a secure TEE (Trusted Execution Environment) on Oasis Sapphire, ROFL verifies your activity without accessing the actual content of your posts or interactions."
    },
    {
      number: 3,
      title: "Zero-Knowledge Verification",
      description: "Privacy-preserving proof generation and verification.",
      details: "When creating or executing a will, zero-knowledge proofs are generated to verify the validity of the will and activity status without revealing any private information. The proofs are verified on-chain using the Oasis Sapphire network, ensuring complete privacy and security."
    },
    {
      number: 4,
      title: "Automated Execution",
      description: "Smart contract execution based on activity verification.",
      details: "If ROFL detects prolonged inactivity beyond the specified timeframe, the will becomes executable. Beneficiaries can then submit their claims, which are verified using zero-knowledge proofs before the will is executed on the Oasis Sapphire network."
    }
  ];

  return (
    <div id="how-it-works" className="py-24 bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How It Works</h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Our platform combines ROFL activity verification with zero-knowledge proofs on Oasis Sapphire to ensure privacy and security.
          </p>
        </div>

        {/* System Architecture Diagram */}
        <div className="mx-auto max-w-4xl mb-16">
          <img 
            src="/zkwilldiagram.drawio.png" 
            alt="ZK-Will System Architecture" 
            className="w-full rounded-xl shadow-2xl border-2 border-[#2a2a2a]"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
              <h3 className="text-xl font-semibold text-[#a3ffae] mb-4">
                {steps[activeStep - 1].title}
              </h3>
              <p className="text-gray-300 mb-6">
                {steps[activeStep - 1].details}
              </p>
              <div className="p-4 bg-[#232323] rounded-lg text-sm text-gray-400 border-l-4 border-[#a3ffae]">
                <strong className="text-white">Note:</strong> All operations are performed within Oasis Sapphire's secure environment, ensuring complete privacy and tamper-proof execution.
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2">
            <div className="relative">
              {steps.map((step) => (
                <div 
                  key={step.number}
                  className={`mb-6 relative cursor-pointer group ${activeStep === step.number ? 'opacity-100' : 'opacity-70'}`}
                  onClick={() => setActiveStep(step.number)}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${activeStep === step.number ? 'bg-[#a3ffae] text-black' : 'bg-[#232323] text-white'}`}>
                      {step.number}
                    </div>
                    <div className="ml-4">
                      <h4 className={`text-lg font-medium ${activeStep === step.number ? 'text-[#a3ffae]' : 'text-white'}`}>
                        {step.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {step.number < steps.length && (
                    <div className="absolute left-5 top-10 h-full w-px bg-[#2a2a2a]"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;