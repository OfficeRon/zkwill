import React from 'react';
import { Shield, Lock, FileDigit, Eye } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Lock className="h-10 w-10 text-[#a3ffae]" />,
      title: "Privacy by Design",
      description: "Your will's contents remain completely private until execution time, protected by zero-knowledge cryptography."
    },
    {
      icon: <Shield className="h-10 w-10 text-[#a3ffae]" />,
      title: "Tamper-Proof Records",
      description: "Cryptographic guarantees ensure your will cannot be altered or tampered with after creation."
    },
    {
      icon: <FileDigit className="h-10 w-10 text-[#a3ffae]" />,
      title: "Secure Digital Execution",
      description: "Automated execution with multi-signature verification ensures your wishes are carried out exactly as intended."
    },
    {
      icon: <Eye className="h-10 w-10 text-[#a3ffae]" />,
      title: "Selective Disclosure",
      description: "Control exactly what information is revealed to whom and when, without compromising the integrity of your will."
    }
  ];

  return (
    <div className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Advanced Features</h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Our zero-knowledge will platform combines cutting-edge cryptography with user-friendly design to ensure your legacy is protected.
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:bg-[#232323] transition-colors"
            >
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
              <div className="absolute bottom-0 left-0 h-1 bg-[#a3ffae] transition-all duration-300 w-0 group-hover:w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;