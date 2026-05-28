// components/SubHeader.tsx
'use client';

import { useState } from 'react';
import { Phone, RefreshCw, CreditCard, X } from 'lucide-react';
import ExchangeService from './component/ExchangeService';
import RefundPayment from './component/RefundPayment';

interface SubHeaderProps {
  initialActiveSection?: 'exchange' | 'refund' | null;
}

const SubHeader: React.FC<SubHeaderProps> = ({ initialActiveSection = "refund" }) => {
  const [activeSection, setActiveSection] = useState<'exchange' | 'refund' | null>(initialActiveSection);

  const handleSectionToggle = (section:  'exchange' | 'refund') => {

      setActiveSection(section); // Open new section

  };

  const handleClose = () => {
    setActiveSection(null);
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex flex-col gap-2 p-4"> 

          {/* Payment Refund Option Button */}
          <button
            onClick={() => handleSectionToggle('refund')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeSection === 'refund'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CreditCard size={20} />
            <span className="font-medium">Refund Payment</span>
          </button>

          {/* Exchange Service Button */}
          <button
            onClick={() => handleSectionToggle('exchange')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeSection === 'exchange'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <RefreshCw size={20} />
            <span className="font-medium">Edit Services</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeSection && (
          <div className="p-3 animate-fadeIn">
            <div className="relative">

              {activeSection === 'exchange' && (
                <ExchangeService />
              )}

              {activeSection === 'refund' && (
                <RefundPayment />
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    </div>
  );
};

export default SubHeader;
