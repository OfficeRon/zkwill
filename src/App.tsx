import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  FileDigit, 
  Eye, 
  Settings, 
  ChevronDown, 
  Info, 
  Github, 
  Twitter, 
  Mail,
  ArrowRight
} from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import SecuritySection from './components/SecuritySection';
import FAQ from './components/FAQ';

function App() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <Navbar />
      
      {showBanner && (
        <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] text-white p-4 flex items-center">
          <Eye className="text-[#a3ffae] mr-4 flex-shrink-0" size={24} />
          <div className="flex-grow">
            This is a demonstration of the ZK-Will platform. Secure your legacy with zero-knowledge technology.
            See the <a href="#" className="text-[#a3ffae] underline hover:text-[#7aff85] transition-colors">documentation</a> for more information.
          </div>
          <button 
            onClick={() => setShowBanner(false)}
            className="text-white hover:text-[#a3ffae] transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SecuritySection />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}

export default App;