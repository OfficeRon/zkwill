import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <div className="relative">
        <div className="w-10 h-10 relative">
          <img
            src="/zklogonobg.png"
            alt="ZK Will Logo"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </div>
      <span className="ml-2 text-xl font-bold text-[#a3ffae]">zk-will</span>
    </div>
  );
};

export default Logo; 