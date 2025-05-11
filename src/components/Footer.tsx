// import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="ZK-Will Logo" 
                  className="w-8 h-8 object-contain"
                />
                {/* Shield overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#a3ffae" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-5 h-5"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
              </div>
              <span className="ml-2 text-xl font-bold text-[#a3ffae]">zk-will</span>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Secure our legacy with zero-knowledge technology. Privacy-first digital will solution.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#a3ffae]">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#a3ffae]">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#a3ffae]">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-[#a3ffae] text-sm">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#a3ffae] text-sm">Security</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#a3ffae] text-sm">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#a3ffae] text-sm">Resources</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-[#a3ffae] text-sm">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#a3ffae] text-sm">Guides</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#a3ffae] text-sm">API Status</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#a3ffae] text-sm">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-[#a3ffae] text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#a3ffae] text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#a3ffae] text-sm">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#a3ffae] text-sm">Compliance</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-[#2a2a2a]">
          <p className="text-center text-xs text-gray-400">
            &copy; 2025 ZK-Will. All rights reserved. This is a demonstration website.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;