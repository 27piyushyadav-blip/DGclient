// ExchangePage.tsx
import React, { useState, useRef } from 'react';
import {
  ArrowLeftRight,
  CheckCircle,
  RefreshCw,
  Send,
  FileText,
  Users,
  Receipt,
  History,
  Search,
  Filter,
  Plus,
  Minus,
  Trash2,
  Star,
  Briefcase,
  Award,
  Eye,
  Zap,
  Bell,
  Shield,
  Logs,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Copy,
  AlertCircle,
  User,
  Clock,
  CreditCard,
  Wallet,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Sparkles,
  Upload,
  Flag,
  Heart,
  Landmark,
  Smartphone,
  Link2,
  HelpCircle,
  Repeat,
  TrendingUp,
  Lightbulb,
  ArrowRightLeft,
  Banknote,
  Coins,
  Settings,
  BadgeDollarSignIcon,
} from 'lucide-react';
import { createEditServiceRequestApi } from '@/lib/bookingsApi';

// Types
type Service = {
  id: string;
  name: string;
  duration: string;
  price: number;
  category: string;
  image: string;
};

type SelectedService = Service & {
  quantity: number;
};

type Expert = {
  id: string;
  name: string;
  role: string;
  experience: string;
  rating: number;
  reviewCount: number;
  image: string;
  specialties: string[];
  services?: any[];
  available: boolean;
};

type TabType = 'exchange' | 'experts' | 'summary' | 'history';
type ExchangeType = 'add_more' | 'refund' | 'adjust_equal';

interface ExchangePageProps {
  bookingId?: string;
  originalServices?: Service[];
  originalTotal?: number;
  availableServices?: Service[];
  availableExperts?: Expert[];
  onExchangeComplete?: (data: any) => void;
}

const defaultOriginalServices: Service[] = [
  { id: 'o1', name: 'Swedish Massage', duration: '60 min', price: 150, category: 'Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop' },
  { id: 'o2', name: 'Hair Styling', duration: '45 min', price: 100, category: 'Hair', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&h=150&fit=crop' },
];

const defaultAvailableServices: Service[] = [
  { id: '1', name: 'Aromatherapy Massage', duration: '60 min', price: 100, category: 'Massage', image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=150&h=150&fit=crop' },
  { id: '2', name: 'Hair Spa Treatment', duration: '60 min', price: 80, category: 'Hair', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&h=150&fit=crop' },
  { id: '3', name: 'Back Massage', duration: '45 min', price: 90, category: 'Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop' },
  { id: '4', name: 'Facial Glow', duration: '45 min', price: 70, category: 'Facial', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=150&h=150&fit=crop' },
  { id: '5', name: 'Deep Tissue Massage', duration: '60 min', price: 120, category: 'Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop' },
  { id: '6', name: 'Manicure & Pedicure', duration: '60 min', price: 65, category: 'Nails', image: 'https://images.unsplash.com/photo-1610991923496-b62c5e2d34cf?w=150&h=150&fit=crop' },
  { id: '7', name: 'Hot Stone Massage', duration: '75 min', price: 140, category: 'Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop' },
  { id: '8', name: 'Body Scrub', duration: '45 min', price: 95, category: 'Body', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=150&h=150&fit=crop' },
  { id: '9', name: 'Swedish Massage', duration: '60 min', price: 150, category: 'Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop' },
  { id: '10', name: 'Hair Styling', duration: '45 min', price: 100, category: 'Hair', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&h=150&fit=crop' },
];

const defaultAvailableExperts: Expert[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Massage Therapist',
    experience: '8 years',
    rating: 4.9,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop',
    specialties: ['Deep Tissue', 'Sports Massage', 'Trigger Point'],
    available: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Hair Stylist Specialist',
    experience: '10 years',
    rating: 4.8,
    reviewCount: 189,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
    specialties: ['Hair Styling', 'Color Treatment', 'Hair Spa'],
    available: true,
  },
  {
    id: '3',
    name: 'Emma Williams',
    role: 'Aromatherapy Expert',
    experience: '6 years',
    rating: 4.9,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    specialties: ['Aromatherapy', 'Swedish Massage', 'Relaxation'],
    available: true,
  },
  {
    id: '4',
    name: 'David Rodriguez',
    role: 'Facial Specialist',
    experience: '7 years',
    rating: 4.7,
    reviewCount: 142,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    specialties: ['Anti-aging', 'Acne Treatment', 'Hydrafacial'],
    available: true,
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    role: 'Nail Care Expert',
    experience: '5 years',
    rating: 4.8,
    reviewCount: 98,
    image: 'https://images.unsplash.com/photo-1534751516642-1d2aa6d3f2d0?w=150&h=150&fit=crop',
    specialties: ['Manicure', 'Pedicure', 'Nail Art'],
    available: true,
  },
  {
    id: '6',
    name: 'James Wilson',
    role: 'Body Therapy Specialist',
    experience: '9 years',
    rating: 4.9,
    reviewCount: 267,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    specialties: ['Body Scrub', 'Hot Stone', 'Therapy'],
    available: true,
  },
];

const categories = ['All', 'Massage', 'Hair', 'Facial', 'Nails', 'Body'];

// Helper component for images with fallback
const ServiceImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200 text-blue-600`}>
        <Sparkles className="w-1/2 h-1/2" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
};

const ExchangeService = ({
  bookingId,
  originalServices = [],
  originalTotal = 0,
  availableServices = [],
  availableExperts = [],
  onExchangeComplete,
}: ExchangePageProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('exchange');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    () => originalServices.map(service => ({ ...service, quantity: 1 }))
  );
  const [selectedExperts, setSelectedExperts] = useState<Record<string, Expert>>({});
  const [activeServiceForExpert, setActiveServiceForExpert] = useState<string | null>(null);

  // Auto-initialize or adjust active service for expert selection
  React.useEffect(() => {
    if (selectedServices.length > 0) {
      const exists = selectedServices.some(s => s.id === activeServiceForExpert);
      if (!exists) {
        setActiveServiceForExpert(selectedServices[0].id);
      }
    } else {
      setActiveServiceForExpert(null);
    }
  }, [selectedServices, activeServiceForExpert]);

  // Backward compatibility wrapper for single selectedExpert
  const selectedExpert = Object.values(selectedExperts)[0] || null;
  const setSelectedExpert = (expert: Expert | null) => {
    if (!expert) {
      setSelectedExperts({});
    } else if (activeServiceForExpert) {
      setSelectedExperts(prev => ({ ...prev, [activeServiceForExpert]: expert }));
    }
  };

  const getExpertMatchScore = (expert: Expert, serviceId: string | null) => {
    if (!serviceId) return 0;
    const service = selectedServices.find(s => s.id === serviceId);
    if (!service) return 0;

    const serviceName = service.name.toLowerCase();
    const serviceCategory = service.category.toLowerCase();

    // Check matching services
    const hasMatchingService = expert.services?.some((s: any) => {
      const name = typeof s === 'string' ? s : s?.name || '';
      return name.toLowerCase().includes(serviceName) || serviceName.includes(name.toLowerCase());
    });

    // Check matching specialties
    const hasMatchingSpecialty = expert.specialties?.some(sp =>
      sp.toLowerCase().includes(serviceCategory) || serviceCategory.includes(sp.toLowerCase())
    );

    if (hasMatchingService) return 2;
    if (hasMatchingSpecialty) return 1;
    return 0;
  };

  const [balanceAction, setBalanceAction] = useState<'refund' | 'credit'>('refund');
  const [exchangeConfirmed, setExchangeConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentLinkSent, setPaymentLinkSent] = useState(false);
  const [refundProcessed, setRefundProcessed] = useState(false);
  const [newReceiptGenerated, setNewReceiptGenerated] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const newTotal = selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const balanceDifference = newTotal - originalTotal;
  const isAdditionalPayment = balanceDifference > 0;
  const isRefundNeeded = balanceDifference < 0;
  const isEqualAmount = balanceDifference === 0;
  const refundAmount = Math.abs(balanceDifference);
  const additionalAmount = balanceDifference;

  const getExchangeType = (): ExchangeType => {
    if (isAdditionalPayment) return 'add_more';
    if (isRefundNeeded) return 'refund';
    return 'adjust_equal';
  };

  const exchangeType = getExchangeType();
  const exchangeTypeInfo = {
    add_more: {
      title: 'Customer wants to add more services',
      description: 'Customer paid less and wants to add more services. Send payment link for remaining amount.',
      icon: Plus,
      color: 'blue',
      bgColor: 'blue',
      action: 'Send Payment Link',
      actionIcon: Send,
    },
    refund: {
      title: 'Customer wants to reduce services',
      description: 'Customer paid more and chose less services. Refund the difference to customer.',
      icon: Banknote,
      color: 'green',
      bgColor: 'green',
      action: 'Process Refund',
      actionIcon: RefreshCw,
    },
    adjust_equal: {
      title: 'Edit for same amount',
      description: 'Customer wants to edit services for same value. Generate new receipt.',
      icon: ArrowRightLeft,
      color: 'purple',
      bgColor: 'purple',
      action: 'Generate New Receipt',
      actionIcon: FileText,
    },
  };

  const currentExchange = exchangeTypeInfo[exchangeType];

  const filteredServices = availableServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addService = (service: Service) => {
    const existing = selectedServices.find(s => s.id === service.id);
    if (existing) {
      setSelectedServices(prev =>
        prev.map(s => (s.id === service.id ? { ...s, quantity: s.quantity + 1 } : s))
      );
    } else {
      setSelectedServices(prev => [...prev, { ...service, quantity: 1 }]);
    }
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const updateQuantity = (serviceId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeService(serviceId);
      return;
    }
    setSelectedServices(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, quantity: newQuantity } : s))
    );
  };

  const clearAllServices = () => {
    setSelectedServices([]);
  };

  const handleSelectExpert = (expert: Expert) => {
    if (!activeServiceForExpert) return;
    
    setSelectedExperts(prev => {
      const isAlreadySelected = prev[activeServiceForExpert]?.id === expert.id;
      const next = { ...prev };
      if (isAlreadySelected) {
        delete next[activeServiceForExpert];
      } else {
        next[activeServiceForExpert] = expert;
      }
      return next;
    });
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleSendPaymentLink = async () => {
    setIsProcessing(true);
    try {
      await createEditServiceRequestApi({
        bookingId: bookingId || 'booking-id-placeholder',
        originalService: originalServices.map(s => s.name).join(', '),
        originalAmount: originalTotal?.toString() || '0',
        newService: selectedServices.map(s => s.name).join(', '),
        newAmount: selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0).toString(),
        reason: `Client requested service change (Additional Payment of $${additionalAmount} Needed)`,
        metadata: {
          additionalServices: selectedServices,
          removedServices: [],
          balanceDifference: additionalAmount,
          actionNeeded: 'Collect Additional Payment',
          expertAssignments: Object.entries(selectedExperts).map(([serviceId, exp]) => ({
            serviceId,
            serviceName: selectedServices.find(s => s.id === serviceId)?.name || '',
            expertId: exp.id,
            expertName: exp.name,
          })),
        },
      });
      setIsProcessing(false);
      setPaymentLinkSent(true);
      setTimeout(() => {
        window.location.href = '/appointments';
      }, 2000);
    } catch (error) {
      console.error('Failed to send payment request:', error);
      setIsProcessing(false);
      alert('Failed to process additional payment request. Please try again.');
    }
  };

  const handleProcessRefund = async () => {
    setIsProcessing(true);
    try {
      await createEditServiceRequestApi({
        bookingId: bookingId || 'booking-id-placeholder',
        originalService: originalServices.map(s => s.name).join(', '),
        originalAmount: originalTotal?.toString() || '0',
        newService: selectedServices.map(s => s.name).join(', '),
        newAmount: selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0).toString(),
        reason: `Client requested service change (Refund of $${refundAmount} Needed)`,
        metadata: {
          additionalServices: selectedServices,
          removedServices: [],
          balanceDifference: -refundAmount,
          actionNeeded: 'Refund Difference',
          expertAssignments: Object.entries(selectedExperts).map(([serviceId, exp]) => ({
            serviceId,
            serviceName: selectedServices.find(s => s.id === serviceId)?.name || '',
            expertId: exp.id,
            expertName: exp.name,
          })),
        },
      });
      
      setIsProcessing(false);
      setRefundProcessed(true);
      setTimeout(() => {
        window.location.href = '/appointments';
      }, 2000);
    } catch (error) {
      console.error('Failed to process edit service request:', error);
      setIsProcessing(false);
      alert('Failed to process refund request. Please try again.');
    }
  };

  const handleGenerateReceipt = async () => {
    setIsProcessing(true);
    try {
      await createEditServiceRequestApi({
        bookingId: bookingId || 'booking-id-placeholder',
        originalService: originalServices.map(s => s.name).join(', '),
        originalAmount: originalTotal?.toString() || '0',
        newService: selectedServices.map(s => s.name).join(', '),
        newAmount: selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0).toString(),
        reason: 'Client requested service change (Equal Amount)',
        metadata: {
          additionalServices: selectedServices,
          removedServices: [],
          balanceDifference: 0,
          actionNeeded: 'Direct Exchange',
          expertAssignments: Object.entries(selectedExperts).map(([serviceId, exp]) => ({
            serviceId,
            serviceName: selectedServices.find(s => s.id === serviceId)?.name || '',
            expertId: exp.id,
            expertName: exp.name,
          })),
        },
      });
      setIsProcessing(false);
      setNewReceiptGenerated(true);
      setTimeout(() => {
        window.location.href = '/appointments';
      }, 2000);
    } catch (error) {
      console.error('Failed to generate exchange request:', error);
      setIsProcessing(false);
      alert('Failed to process exchange request. Please try again.');
    }
  };

  const handleConfirmExchange = async () => {
    setShowPaymentModal(true);
    setIsProcessing(true);
    try {
      await createEditServiceRequestApi({
        bookingId: bookingId || 'booking-id-placeholder',
        originalService: originalServices.map(s => s.name).join(', '),
        originalAmount: originalTotal?.toString() || '0',
        newService: selectedServices.map(s => s.name).join(', '),
        newAmount: selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0).toString(),
        reason: `Client confirmed service exchange (${exchangeType.replace('_', ' ')})`,
        metadata: {
          additionalServices: selectedServices,
          removedServices: [],
          balanceDifference: balanceDifference,
          actionNeeded: exchangeType === 'add_more' ? 'Collect Additional Payment' : exchangeType === 'refund' ? 'Refund Difference' : 'Direct Exchange',
          expertAssignments: Object.entries(selectedExperts).map(([serviceId, exp]) => ({
            serviceId,
            serviceName: selectedServices.find(s => s.id === serviceId)?.name || '',
            expertId: exp.id,
            expertName: exp.name,
          })),
        },
      });
      
      setIsProcessing(false);
      setExchangeConfirmed(true);
      
      setTimeout(() => {
        setShowPaymentModal(false);
        if (onExchangeComplete) {
          onExchangeComplete({
            selectedServices,
            selectedExperts,
            exchangeType,
            newTotal,
            difference: balanceDifference,
          });
        }
        window.location.href = '/appointments';
      }, 3000);
    } catch (error) {
      console.error('Failed to confirm exchange request:', error);
      setIsProcessing(false);
      setShowPaymentModal(false);
      alert('Failed to submit exchange request. Please try again.');
    }
  };

  const getActionButton = () => {
    switch (exchangeType) {
      case 'add_more':
        return (
          <button
            onClick={handleSendPaymentLink}
            disabled={isProcessing || selectedServices.length === 0}
            className="px-5 py-2 rounded-xl font-medium transition flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <BadgeDollarSignIcon className="w-4 h-4" />
                Pay (${additionalAmount})
              </>
            )}
          </button>
        );
      case 'refund':
        return (
          <button
            onClick={handleProcessRefund}
            disabled={isProcessing || selectedServices.length === 0}
            className="px-5 py-2 rounded-xl font-medium transition flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 shadow-md"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Process Refund (${refundAmount})
              </>
            )}
          </button>
        );
      case 'adjust_equal':
        return (
          <button
            onClick={handleGenerateReceipt}
            disabled={isProcessing || selectedServices.length === 0}
            className="px-5 py-2 rounded-xl font-medium transition flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 shadow-md"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate New Receipt
              </>
            )}
          </button>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'exchange' as TabType, label: 'Edit Services', icon: ArrowLeftRight, description: 'Modify customer services' },
    { id: 'experts' as TabType, label: 'Edit Expert', icon: Users, description: 'Select preferred expert' },
    { id: 'summary' as TabType, label: 'Edit Summary', icon: Receipt, description: 'Review & confirm' },
    { id: 'history' as TabType, label: 'Transaction History', icon: History, description: 'View edit logs' },
  ];

  const isTabComplete = (tab: TabType): boolean => {
    switch (tab) {
      case 'exchange':
        return selectedServices.length > 0;
      case 'experts':
        return selectedExpert !== null;
      case 'summary':
        return true;
      case 'history':
        return true;
      default:
        return false;
    }
  };

  const getTabStatus = (tab: TabType): 'completed' | 'current' | 'pending' => {
    if (activeTab === tab) return 'current';
    const tabIndex = tabs.findIndex(t => t.id === tab);
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    if (tabIndex < activeIndex && isTabComplete(tabs[tabIndex].id)) return 'completed';
    return 'pending';
  };

  const goToNextTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex < tabs.length - 1 && isTabComplete(activeTab)) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const goToPrevTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-3 px-4">
      <div className="max-w-full mx-auto">
        {/* Modern Tab Bar */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 p-1.5">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const status = getTabStatus(tab.id);
                const isActive = activeTab === tab.id;
                const isCompleted = status === 'completed';
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (isCompleted || idx <= tabs.findIndex(t => t.id === activeTab)) {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`
                      flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : isCompleted
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }
                      ${!isCompleted && !isActive && idx > tabs.findIndex(t => t.id === activeTab) 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'cursor-pointer'
                      }
                    `}
                    disabled={!isCompleted && !isActive && idx > tabs.findIndex(t => t.id === activeTab)}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center transition-all
                      ${isActive 
                        ? 'bg-white/20' 
                        : isCompleted
                          ? 'bg-green-100'
                          : 'bg-slate-100'
                      }
                    `}>
                      {isCompleted && !isActive ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isCompleted ? 'text-green-600' : 'text-slate-400'}`} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${isActive ? 'text-white' : isCompleted ? 'text-green-700' : 'text-slate-600'}`}>
                        {tab.label}
                      </p>
                      <p className={`text-xs ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                        {tab.description}
                      </p>
                    </div>
                    {idx < tabs.length - 1 && (
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white/50' : 'text-slate-300'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[33rem] overflow-y-scroll scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {/* Main Form Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-t-2xl shadow-xl border border-slate-100 overflow-hidden">
              {/* Original Purchased Services */}
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="font-semibold text-slate-800">Original Purchased Services</h2>
                </div>
                <div className="space-y-2">
                  {originalServices.map((service) => (
                    <div key={service.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                      <ServiceImage src={service.image} alt={service.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">{service.name}</p>
                        <p className="text-xs text-slate-500">{service.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-green-600">Purchased</p>
                        <p className="font-semibold text-slate-800">${service.price}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Total Paid by Customer</span>
                    <span className="text-xl font-bold text-blue-600">${originalTotal}</span>
                  </div>
                </div>
              </div>

              {/* Exchange Tab */}
              {activeTab === 'exchange' && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Add New Services</h2>
                      <p className="text-sm text-slate-500">Select services to edit with original purchase</p>
                    </div>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex gap-3 mb-5">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/30 text-slate-800"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-slate-50/30 appearance-none cursor-pointer text-slate-800"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat} className="text-slate-800 bg-white">{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Available Services Grid */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-slate-700 mb-3">Available Services</p>
                    <div className="grid grid-cols-2 gap-3  pr-2">
                      {filteredServices.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => addService(service)}
                          className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition text-left group"
                        >
                          <ServiceImage src={service.image} alt={service.name} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-800 text-sm">{service.name}</p>
                            <p className="text-xs text-slate-500">{service.duration}</p>
                            <p className="text-sm font-semibold text-blue-600">${service.price}</p>
                          </div>
                          <Plus className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Exchange Services */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-medium text-slate-700">Add & Remove Services</p>
                      {selectedServices.length > 0 && (
                        <button onClick={clearAllServices} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                          <Trash2 className="w-3 h-3" />
                          Clear All
                        </button>
                      )}
                    </div>
                    
                    {selectedServices.length > 0 ? (
                      <div className="space-y-2 bg-slate-100 p-3">
                        {selectedServices.map((service) => (
                          <div key={service.id} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                            <ServiceImage src={service.image} alt={service.name} className="w-10 h-10 rounded-lg object-cover" />
                            <div className="flex-1">
                              <p className="font-medium text-slate-800 text-sm">{service.name}</p>
                              <p className="text-xs text-slate-500">{service.duration}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(service.id, service.quantity - 1)}
                                  className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:border-blue-200 transition cursor-pointer"
                                >
                                  <Minus className="w-5 h-5" />
                                </button>
                                <span className="w-8 text-center font-medium text-sm">{service.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(service.id, service.quantity + 1)}
                                  className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:border-blue-200 transition cursor-pointer"
                                >
                                  <Plus className="h-5 w-5" />
                                </button>
                              </div>
                              <div className="w-16 text-right font-semibold text-blue-600">
                                ${service.price * service.quantity}
                              </div>
                              <button onClick={() => removeService(service.id)} className="text-slate-400 hover:text-red-500 transition cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                          <span className="font-semibold text-slate-800">New Services Total</span>
                          <span className="text-xl font-bold text-blue-600">${newTotal}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-slate-50 rounded-xl">
                        <ArrowLeftRight className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-400">No services selected for editing</p>
                        <p className="text-xs text-slate-400">Click on services above to add</p>
                      </div>
                    )}
                  </div>

                  {/* Payment Adjustment */}
                  {selectedServices.length > 0 && !isEqualAmount && (
                    <div className={`mt-6 p-4 bg-${currentExchange.bgColor}-50 rounded-xl border border-${currentExchange.bgColor}-200`}>
                      <h3 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                        <DollarSign className={`w-4 h-4 text-${currentExchange.color}-600`} />
                        Payment Adjustment
                      </h3>
                      
                      {exchangeType === 'add_more' && (
                        <>
                          <div className="mb-3 p-2 bg-blue-100 rounded-lg">
                            <p className="text-sm text-blue-800">
                              Customer wants to add more services. They need to pay additional ${additionalAmount}.
                            </p>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Already Paid</span>
                              <span className="font-semibold text-blue-600">${originalTotal}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">New Services Total</span>
                              <span className="font-semibold text-blue-600">${newTotal}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-blue-200">
                              <span className="text-slate-700 font-medium">Additional Payment Needed</span>
                              <span className="font-bold text-blue-600">${additionalAmount}</span>
                            </div>
                          </div>
                        </>
                      )}

                      {exchangeType === 'refund' && (
                        <>
                          <div className="mb-3 p-2 bg-green-100 rounded-lg">
                            <p className="text-sm text-green-800">
                              Customer wants to choose less services. Refund ${refundAmount} to customer.
                            </p>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Already Paid</span>
                              <span className="font-semibold">${originalTotal}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">New Services Total</span>
                              <span className="font-semibold text-green-600">${newTotal}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-green-200">
                              <span className="text-slate-700 font-medium">Refund Amount</span>
                              <span className="font-bold text-green-600">${refundAmount}</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm text-slate-700 mb-2">Refund to:</p>
                            <div className="flex gap-3">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  value="refund"
                                  checked={balanceAction === 'refund'}
                                  onChange={() => setBalanceAction('refund')}
                                  className="text-green-600"
                                />
                                <span className="text-sm">Original Payment Method</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  value="credit"
                                  checked={balanceAction === 'credit'}
                                  onChange={() => setBalanceAction('credit')}
                                  className="text-green-600"
                                />
                                <span className="text-sm">Store Credit</span>
                              </label>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Exchange Expert Tab */}
              {activeTab === 'experts' && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Edit Expert</h2>
                      <p className="text-sm text-slate-500">Select preferred experts for your edited services (optional)</p>
                    </div>
                  </div>

                  {/* Selected Services Assignment Tracker */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Assign Expert Per Service</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedServices.map((service) => {
                        const assignedExpert = selectedExperts[service.id];
                        const isActive = activeServiceForExpert === service.id;
                        return (
                          <div
                            key={service.id}
                            onClick={() => setActiveServiceForExpert(service.id)}
                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                              isActive
                                ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-slate-800 text-sm">{service.name}</h4>
                                <p className="text-xs text-slate-500">{service.duration} • ${service.price}</p>
                              </div>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                                isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {isActive ? 'Assigning Now' : 'Click to Assign'}
                              </span>
                            </div>
                            
                            {assignedExpert ? (
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                                <ServiceImage src={assignedExpert.image} alt={assignedExpert.name} className="w-6 h-6 rounded-full object-cover" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-slate-700 truncate">{assignedExpert.name}</p>
                                  <p className="text-[10px] text-slate-500 truncate">{assignedExpert.role}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2 pt-2 border-t border-slate-100 border-dashed text-center">
                                <span className="text-[11px] text-slate-400 italic">No expert assigned yet</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {activeServiceForExpert && (
                    <div className="mt-6 border-t border-slate-100 pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-medium text-slate-700">
                          Available Specialists for <span className="font-semibold text-blue-600">{selectedServices.find(s => s.id === activeServiceForExpert)?.name}</span>:
                        </p>
                      </div>

                      {/* Horizontal Scroll Experts Section */}
                      <div className="relative">
                        <button
                          onClick={handleScrollLeft}
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition"
                        >
                          <ChevronLeft className="w-4 h-4 text-slate-600" />
                        </button>

                        <div
                          ref={scrollContainerRef}
                          className="flex gap-4 overflow-x-auto scroll-smooth pb-4 px-8 hide-scrollbar"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          {(() => {
                            const filtered = availableExperts.filter((expert) => {
                              if (!activeServiceForExpert) return true;
                              const score = getExpertMatchScore(expert, activeServiceForExpert);
                              return score > 0;
                            });

                            if (filtered.length === 0) {
                              return (
                                <div className="w-full text-center py-10 text-slate-400 italic text-sm">
                                  No specialists currently provide this service.
                                </div>
                              );
                            }

                            return filtered.map((expert) => {
                              const isSelected = selectedExperts[activeServiceForExpert]?.id === expert.id;
                              const matchScore = getExpertMatchScore(expert, activeServiceForExpert);
                              return (
                                <div
                                  key={expert.id}
                                  onClick={() => handleSelectExpert(expert)}
                                  className={`flex-shrink-0 w-72 cursor-pointer transition-all duration-200 ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
                                >
                                  <div className={`relative rounded-xl border-2 overflow-hidden transition-all ${isSelected ? 'border-blue-500 shadow-lg shadow-blue-200' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'} ${!expert.available ? 'opacity-60' : ''}`}>
                                    {!expert.available && (
                                      <div className="absolute top-3 right-3 z-10 bg-slate-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        Unavailable
                                      </div>
                                    )}
                                    {matchScore > 0 && expert.available && (
                                      <div className="absolute top-3 left-3 z-10 bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full font-medium shadow-sm">
                                        Specialist Match
                                      </div>
                                    )}
                                    {isSelected && expert.available && (
                                      <div className="absolute top-3 right-3 z-10">
                                        <CheckCircle className="w-6 h-6 text-blue-500 bg-white rounded-full" />
                                      </div>
                                    )}
                                    <div className="p-4">
                                      <div className="flex items-center gap-3 mb-3">
                                        <ServiceImage src={expert.image} alt={expert.name} className="w-16 h-16 rounded-xl object-cover" />
                                        <div className="min-w-0 flex-1">
                                          <h3 className="font-semibold text-slate-800 truncate">{expert.name}</h3>
                                          <p className="text-xs text-blue-600 truncate">{expert.role}</p>
                                          <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-xs font-medium text-slate-700">{expert.rating}</span>
                                            <span className="text-xs text-slate-400">({expert.reviewCount})</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                        <Briefcase className="w-3 h-3" />
                                        <span>{expert.experience} experience</span>
                                        <Award className="w-3 h-3 ml-2" />
                                        <span>Certified</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {expert.specialties.slice(0, 2).map((specialty, idx) => (
                                          <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                            {specialty}
                                          </span>
                                        ))}
                                        {expert.specialties.length > 2 && (
                                          <span className="text-xs text-slate-400">+{expert.specialties.length - 2}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>

                        <button
                          onClick={handleScrollRight}
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {activeServiceForExpert && selectedExperts[activeServiceForExpert] && (
                    <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3">
                        <ServiceImage src={selectedExperts[activeServiceForExpert].image} alt={selectedExperts[activeServiceForExpert].name} className="w-14 h-14 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-700">Selected Expert for {selectedServices.find(s => s.id === activeServiceForExpert)?.name}</span>
                          </div>
                          <p className="font-semibold text-slate-800 mt-1 truncate">{selectedExperts[activeServiceForExpert].name}</p>
                          <p className="text-sm text-slate-500 truncate">{selectedExperts[activeServiceForExpert].role}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedExperts(prev => {
                              const next = { ...prev };
                              delete next[activeServiceForExpert];
                              return next;
                            });
                          }}
                          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Deselect
                        </button>
                      </div>
                    </div>
                  )}

                  {activeServiceForExpert && !selectedExperts[activeServiceForExpert] && (
                    <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">No expert selected for this service. You can skip this or select a specialist above.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Edit Summary</h2>
                      <p className="text-sm text-slate-500">Review edit details before confirming</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={`p-4 bg-${currentExchange.bgColor}-50 rounded-xl border border-${currentExchange.bgColor}-200`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-${currentExchange.bgColor}-100 flex items-center justify-center`}>
                          {React.createElement(currentExchange.icon, { className: `w-5 h-5 text-${currentExchange.color}-600` })}
                        </div>
                        <div>
                          <h3 className={`font-semibold text-${currentExchange.color}-800`}>{currentExchange.title}</h3>
                          <p className={`text-sm text-${currentExchange.color}-700`}>{currentExchange.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-600">Original Services Total</span>
                        <span className="font-semibold text-blue-600">${originalTotal}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-600">New Services Total</span>
                        <span className="font-semibold text-blue-600">${newTotal}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-600">Amount Paid</span>
                        <span className="font-semibold text-blue-600">${originalTotal}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between">
                        <span className="font-medium text-slate-800">
                          {exchangeType === 'add_more' ? 'Additional Payment Needed' : 
                           exchangeType === 'refund' ? 'Refund Amount' : 
                           'Balance'}
                        </span>
                        <span className={`font-bold text-lg ${
                          exchangeType === 'add_more' ? 'text-blue-600' : 
                          exchangeType === 'refund' ? 'text-green-600' : 
                          'text-purple-600'
                        }`}>
                          {exchangeType === 'add_more' ? `$${additionalAmount}` : 
                           exchangeType === 'refund' ? `$${refundAmount}` : 
                           '$0 (Same amount)'}
                        </span>
                      </div>
                    </div>

                    {Object.keys(selectedExperts).length > 0 && (
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-slate-700">Assigned Experts per Service</span>
                        </div>
                        <div className="space-y-3">
                          {selectedServices.map(service => {
                            const exp = selectedExperts[service.id];
                            if (!exp) return null;
                            return (
                              <div key={service.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-100">
                                <ServiceImage src={exp.image} alt={exp.name} className="w-10 h-10 rounded-lg object-cover" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-slate-800 text-xs truncate">{exp.name}</p>
                                  <p className="text-[10px] text-slate-500 truncate">{service.name} Specialist</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-[10px] font-medium text-slate-700">{exp.rating}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h3 className="font-medium text-slate-800 mb-3">New Services</h3>
                      <div className="space-y-2">
                        {selectedServices.map((service) => (
                          <div key={service.id} className="flex justify-between text-sm">
                            <span className="text-slate-600">{service.name} x{service.quantity}</span>
                            <span className="font-medium text-blue-600">${service.price * service.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl">
                      <h3 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                        How Editing Works
                      </h3>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">1</div>
                          <span>Select new services from the list</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">2</div>
                          <span>Choose a preferred expert (optional)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">3</div>
                          <span>System calculates the difference automatically</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">4</div>
                          <span>
                            {exchangeType === 'add_more' ? 'Send payment link for remaining amount' :
                             exchangeType === 'refund' ? 'Process refund to customer' :
                             'Generate new receipt for editing'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">5</div>
                          <span>Confirm edit once settled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <History className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Transaction History</h2>
                      <p className="text-sm text-slate-500">All editing transactions are logged for transparency</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">Original Order</p>
                            <p className="text-xs text-slate-500">May 15, 2025 • 10:30 AM</p>
                          </div>
                        </div>
                        <span className="font-semibold text-green-600">+${originalTotal}</span>
                      </div>
                      <div className="pl-10 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Order ID</span>
                          <span className="font-mono text-xs">#VO-28473</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Services</span>
                          <span className="text-slate-600">{originalServices.map(s => s.name).join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    {exchangeConfirmed && (
                      <div className={`p-4 rounded-xl border border-${currentExchange.bgColor}-200 bg-${currentExchange.bgColor}-50`}>
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full bg-${currentExchange.bgColor}-100 flex items-center justify-center`}>
                              <ArrowLeftRight className={`w-4 h-4 text-${currentExchange.color}-600`} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">Service Edit</p>
                              <p className="text-xs text-slate-500">{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</p>
                            </div>
                          </div>
                          <span className={`font-semibold text-${currentExchange.color}-600`}>
                            {exchangeType === 'add_more' ? `+$${additionalAmount}` : 
                             exchangeType === 'refund' ? `-$${refundAmount}` : 
                             'Edit'}
                          </span>
                        </div>
                        <div className="pl-10 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Edit ID</span>
                            <span className="font-mono text-xs">EDIT-{Math.floor(Math.random() * 90000) + 10000}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Edit Type</span>
                            <span className="capitalize">{exchangeType.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">New Services</span>
                            <span className="text-slate-600">{selectedServices.map(s => s.name).join(', ')}</span>
                          </div>
                          {selectedExpert && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Assigned Expert</span>
                              <span className="text-slate-600">{selectedExpert.name}</span>
                            </div>
                          )}
                          <div className="pt-2 border-t border-slate-200 flex justify-between">
                            <span className="text-slate-500">Adjustment</span>
                            <span className={`font-medium ${
                              exchangeType === 'add_more' ? 'text-blue-600' : 
                              exchangeType === 'refund' ? 'text-green-600' : 
                              'text-purple-600'
                            }`}>
                              {exchangeType === 'add_more' ? `+$${additionalAmount} (Paid)` : 
                               exchangeType === 'refund' ? `-$${refundAmount} (Refunded)` : 
                               'No payment adjustment'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {!exchangeConfirmed && selectedServices.length === 0 && (
                      <div className="p-4 bg-slate-50 rounded-xl text-center">
                        <ArrowLeftRight className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No edit initiated yet</p>
                        <p className="text-xs text-slate-400">Select services to start edit</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              
            </div>

              {/* Navigation Buttons */}
              <div className="sticky bottom-0 px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shadow-slate-200 rounded-b-2xl">
                <button
                  onClick={goToPrevTab}
                  className={`px-5 py-2 rounded-xl font-medium transition ${
                    tabs.findIndex(t => t.id === activeTab) > 0
                      ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'opacity-50 cursor-not-allowed bg-white border border-slate-200 text-slate-400'
                  }`}
                  disabled={tabs.findIndex(t => t.id === activeTab) === 0}
                >
                  Back
                </button>
                {activeTab !== 'history' ? (
                  <button
                    onClick={goToNextTab}
                    disabled={!isTabComplete(activeTab)}
                    className={`px-5 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
                      isTabComplete(activeTab)
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmExchange}
                    disabled={isProcessing || exchangeConfirmed || selectedServices.length === 0}
                    className={`px-5 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
                      !exchangeConfirmed && selectedServices.length > 0
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Confirm Edit
                      </>
                    )}
                  </button>
                )}
              </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 sticky top-6">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-800">Edit Preview</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">Real-time edit summary</p>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Original Total</span>
                  <span className="font-semibold text-blue-600">${originalTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">New Total</span>
                  <span className="font-semibold text-blue-600">${newTotal}</span>
                </div>

                {Object.keys(selectedExperts).length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Assigned Experts</p>
                    <div className="space-y-2">
                      {selectedServices.map(service => {
                        const exp = selectedExperts[service.id];
                        if (!exp) return null;
                        return (
                          <div key={service.id} className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-lg">
                            <ServiceImage src={exp.image} alt={exp.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-700 text-xs truncate">{exp.name}</p>
                              <p className="text-slate-500 text-[10px] truncate">{service.name}</p>
                            </div>
                            <span className="text-[10px] text-slate-600 font-semibold">{exp.rating} ★</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-between font-semibold">
                  <span className="text-slate-800">Difference</span>
                  <span className={
                    isAdditionalPayment ? 'text-blue-600' : 
                    isRefundNeeded ? 'text-green-600' : 
                    'text-purple-600'
                  }>
                    {isAdditionalPayment ? `+$${additionalAmount} (To Pay)` : 
                     isRefundNeeded ? `-$${refundAmount} (To Refund)` : 
                     '$0 (Same Amount)'}
                  </span>
                </div>

                {selectedServices.length > 0 && !exchangeConfirmed && (
                  <div className="pt-2">
                    {getActionButton()}
                  </div>
                )}

                <div className="pt-4">
                  <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2.5 rounded-xl mb-2">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Smart Adjustment - Real-time calculation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2.5 rounded-xl mb-2">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Instant Notifications to customer</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 p-2.5 rounded-xl mb-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Secure Payments & Receipts</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <Logs className="w-3.5 h-3.5" />
                    <span>Transaction History Logged</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 transform scale-100 transition-all">
            {!exchangeConfirmed ? (
              <div className="space-y-6">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center bg-blue-50 rounded-2xl">
                  <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-2xl animate-ping opacity-25"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">Waiting for Payment Confirmation</h3>
                  <p className="text-sm text-slate-500">
                    We are currently processing and verifying your exchange order transaction details. Please do not close or refresh this page.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs bg-slate-50 py-2.5 px-4 rounded-xl text-slate-600 border border-slate-100">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Secured and encrypted transaction gateway</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-scaleUp">
                <div className="w-20 h-20 mx-auto bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">Exchange Request Submitted!</h3>
                  <p className="text-sm text-slate-500">
                    Your request has been successfully created and sent to the organization dashboard for final approval.
                  </p>
                </div>
                <p className="text-xs text-blue-600 animate-pulse font-medium">Redirecting you to your appointments...</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ExchangeService;