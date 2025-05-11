import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#2a2a2a] last:border-b-0">
      <button
        className="flex justify-between items-center w-full py-4 px-6 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-white">{question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-[#a3ffae]" />
        ) : (
          <ChevronDown className="h-5 w-5 text-[#a3ffae]" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 px-6">
          <div className="text-gray-300 prose prose-sm prose-invert max-w-none">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
};

const FAQ: React.FC = () => {
  return (
    <section id="faq" className="py-16 bg-[#121212]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#a3ffae] mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-300">Everything you need to know about zk-will</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden shadow-xl">
          <FAQItem
            question="What is a zk-will?"
            answer={
              <>
                <p>
                  A zk-will is a smart contract-based digital will that uses zero-knowledge proofs to ensure privacy 
                  and security while managing digital asset inheritance. It allows you to designate beneficiaries 
                  for your crypto assets while keeping the details private until the inheritance conditions are met.
                </p>
              </>
            }
          />
          
          <FAQItem
            question="How does the inheritance process work?"
            answer={
              <>
                <p>
                  The inheritance process has three main components:
                </p>
                <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li>
                    <strong>Will Creation</strong>: You create a will specifying your beneficiaries and the assets they'll receive.
                  </li>
                  <li>
                    <strong>Proof of Life</strong>: You regularly check in to prove you're still alive. This can be configured 
                    to your preference (monthly, quarterly, etc.).
                  </li>
                  <li>
                    <strong>Claim Process</strong>: If you don't check in for an extended period, your beneficiaries can initiate 
                    a claim. After a waiting period and verification, the assets are transferred to them.
                  </li>
                </ol>
              </>
            }
          />

          <FAQItem
            question="What happens if I lose access to my wallet?"
            answer={
              <>
                <p>
                  If you lose access to your wallet but are still alive, you should:
                </p>
                <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li>Create a new wallet immediately</li>
                  <li>Update your will with the new wallet information</li>
                  <li>Complete a proof of life check from your new wallet</li>
                </ol>
                <p className="mt-2">
                  It's also recommended to set up a recovery method like a recovery phrase or a social recovery system.
                </p>
              </>
            }
          />

          <FAQItem
            question="Is my will information private?"
            answer={
              <>
                <p>
                  Yes. We use zero-knowledge proofs to ensure that the details of your will (beneficiaries, asset allocations) 
                  remain private. The blockchain only stores encrypted information and proofs that validate the will's 
                  execution conditions without revealing its contents.
                </p>
                <p className="mt-2">
                  Only you and your designated beneficiaries can see the relevant details of the will.
                </p>
              </>
            }
          />

          <FAQItem
            question="What blockchains do you support?"
            answer={
              <>
                <p>
                  Currently, zk-will supports the following blockchains:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Ethereum Mainnet</li>
                  <li>Polygon (POL)</li>
                  <li>Goerli Testnet (for testing)</li>
                  <li>Mumbai Testnet (for testing)</li>
                </ul>
                <p className="mt-2">
                  We plan to add more blockchain networks in the future based on community demand and technical feasibility.
                </p>
              </>
            }
          />

          <FAQItem
            question="What fees are involved?"
            answer={
              <>
                <p>
                  There are two types of fees involved:
                </p>
                <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li>
                    <strong>Network fees</strong>: Standard blockchain transaction fees (gas) when creating or updating your will, 
                    completing proof of life checks, or executing a will.
                  </li>
                  <li>
                    <strong>Service fees</strong>: A small fee (1.5%) is charged when a will is executed to maintain the platform. 
                    There are no fees for creating or updating a will.
                  </li>
                </ol>
              </>
            }
          />

          <FAQItem
            question="How secure is zk-will?"
            answer={
              <>
                <p>
                  zk-will is built with security as a top priority:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>All smart contracts are audited by independent security firms</li>
                  <li>Zero-knowledge proofs ensure privacy and security of your data</li>
                  <li>No central authority can access or modify your will</li>
                  <li>Open-source code allows for community review and verification</li>
                  <li>Multi-layered security protocols protect against various attack vectors</li>
                </ul>
                <p className="mt-2">
                  However, please remember that blockchain transactions are irreversible, so always double-check your inputs when creating or updating your will.
                </p>
              </>
            }
          />
        </div>
      </div>
    </section>
  );
};

export default FAQ; 