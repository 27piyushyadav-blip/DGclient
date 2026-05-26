// components/SubHeader.tsx
'use client';

import { useState } from 'react';
import { Phone, RefreshCw, CreditCard } from 'lucide-react';
import VoiceCall from './component/VoiceCall';
import ExchangeService from './component/ExchangeService';
import RefundPayment from './component/RefundPayment';

interface SubHeaderProps {
  initialActiveSection?: 'call' | 'exchange' | 'refund' | null;
}

const SubHeader: React.FC<SubHeaderProps> = ({ initialActiveSection = "call" }) => {
  const [activeSection, setActiveSection] = useState<'call' | 'exchange' | 'refund' | null>(initialActiveSection);

  const handleSectionToggle = (section: 'call' | 'exchange' | 'refund') => {

      setActiveSection(section); // Open new section

  };

  const handleClose = () => {
    setActiveSection(null);
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Subheader Buttons */}
        <div className="flex items-center justify-center gap-6 py-3 ">
          {/* Call Order Button */}
          <button
            onClick={() => handleSectionToggle('call')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeSection === 'call'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Phone size={18} />
            <span className="font-medium">Call Order</span>
          </button>

          {/* Exchange Service Button */}
          <button
            onClick={() => handleSectionToggle('exchange')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeSection === 'exchange'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <RefreshCw size={18} />
            <span className="font-medium">Edit Service</span>
          </button>

          {/* Payment Refund Option Button */}
          <button
            onClick={() => handleSectionToggle('refund')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeSection === 'refund'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CreditCard size={18} />
            <span className="font-medium">Payment Refund</span>
          </button>
        </div>

        {/* Active Section Content */}
        {activeSection && (
          <div className="border-gray-200 py-6 animate-fadeIn">
            <div className="relative">
              {/* Close Button */}

              {/* Conditional Content Rendering */}
              {activeSection === 'call' && (
                <>
                <VoiceCall/>
                </>
              )}

              {activeSection === 'exchange' && (
                <>
                <ExchangeService/>
                </>
              )}

              {activeSection === 'refund' && (
                <>
                <RefundPayment/>
                </>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default SubHeader;
