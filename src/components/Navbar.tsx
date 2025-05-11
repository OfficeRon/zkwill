import { useState } from 'react';
import { Settings, Menu, X } from 'lucide-react';
import MetaMaskConnect from './MetaMaskConnect';
import WalletConnectButton from './WalletConnectButton';
import Logo from './Logo';

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleConnect = (address: string) => {
    console.log('Connected wallet:', address);
  };

  const handleDisconnect = () => {
    console.log('Wallet disconnected');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveLink(sectionId);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="border-b border-[#2a2a2a] bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Logo />
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <a 
                href="#" 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${activeLink === 'home' ? 'text-[#a3ffae] border-b-2 border-[#a3ffae]' : 'text-gray-300 hover:text-[#a3ffae] transition-colors'}`}
                onClick={() => scrollToSection('home')}
              >
                Home
              </a>
              <a 
                href="#how-it-works" 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${activeLink === 'how-it-works' ? 'text-[#a3ffae] border-b-2 border-[#a3ffae]' : 'text-gray-300 hover:text-[#a3ffae] transition-colors'}`}
                onClick={() => scrollToSection('how-it-works')}
              >
                How It Works
              </a>
              <a 
                href="#security" 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${activeLink === 'security' ? 'text-[#a3ffae] border-b-2 border-[#a3ffae]' : 'text-gray-300 hover:text-[#a3ffae] transition-colors'}`}
                onClick={() => scrollToSection('security')}
              >
                Security
              </a>
              <a 
                href="#faq" 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${activeLink === 'faq' ? 'text-[#a3ffae] border-b-2 border-[#a3ffae]' : 'text-gray-300 hover:text-[#a3ffae] transition-colors'}`}
                onClick={() => scrollToSection('faq')}
              >
                FAQ
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <WalletConnectButton />
            </div>
            <button className="flex items-center px-4 py-2 border border-[#2a2a2a] rounded-md bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] transition-colors">
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </button>
            <button
              onClick={toggleMobileMenu}
              className="md:hidden rounded-md p-2 border border-[#2a2a2a] bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1a1a1a] border-b border-[#2a2a2a]">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <a
              href="#"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                activeLink === 'home' ? 'bg-[#232323] text-[#a3ffae]' : 'text-gray-300 hover:bg-[#232323] hover:text-[#a3ffae]'
              }`}
              onClick={() => scrollToSection('home')}
            >
              Home
            </a>
            <a
              href="#how-it-works"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                activeLink === 'how-it-works' ? 'bg-[#232323] text-[#a3ffae]' : 'text-gray-300 hover:bg-[#232323] hover:text-[#a3ffae]'
              }`}
              onClick={() => scrollToSection('how-it-works')}
            >
              How It Works
            </a>
            <a
              href="#security"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                activeLink === 'security' ? 'bg-[#232323] text-[#a3ffae]' : 'text-gray-300 hover:bg-[#232323] hover:text-[#a3ffae]'
              }`}
              onClick={() => scrollToSection('security')}
            >
              Security
            </a>
            <a
              href="#faq"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                activeLink === 'faq' ? 'bg-[#232323] text-[#a3ffae]' : 'text-gray-300 hover:bg-[#232323] hover:text-[#a3ffae]'
              }`}
              onClick={() => scrollToSection('faq')}
            >
              FAQ
            </a>
            <div className="pt-4 pb-2">
              <div className="px-3">
                <MetaMaskConnect
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  minimal={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;