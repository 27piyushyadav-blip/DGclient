import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
  available: boolean;
};

type TabType = 'exchange' | 'experts' | 'summary' | 'history';
type ExchangeType = 'add_more' | 'refund' | 'adjust_equal';

interface ExchangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const ExchangeModal = ({
  open,
  onOpenChange,
  originalServices = defaultOriginalServices,
  originalTotal = 250,
  availableServices = defaultAvailableServices,
  availableExperts = defaultAvailableExperts,
  onExchangeComplete,
}: ExchangeModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('exchange');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    () => originalServices.map(service => ({ ...service, quantity: 1 }))
  );
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
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
      title: 'Exchange for same amount',
      description: 'Customer wants to exchange services for same value. Generate new receipt.',
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
    if (selectedExpert?.id === expert.id) {
      setSelectedExpert(null);
    } else {
      setSelectedExpert(expert);
    }
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

  const handleSendPaymentLink = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentLinkSent(true);
      setTimeout(() => setPaymentLinkSent(false), 3000);
    }, 1500);
  };

  const handleProcessRefund = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setRefundProcessed(true);
      setTimeout(() => setRefundProcessed(false), 3000);
    }, 1500);
  };

  const handleGenerateReceipt = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setNewReceiptGenerated(true);
      setTimeout(() => setNewReceiptGenerated(false), 3000);
    }, 1500);
  };

  const handleConfirmExchange = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setExchangeConfirmed(true);
      if (onExchangeComplete) {
        onExchangeComplete({
          selectedServices,
          selectedExpert,
          exchangeType,
          newTotal,
          difference: balanceDifference,
        });
      }
    }, 1500);
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
    { id: 'exchange' as TabType, label: 'Exchange Services', icon: ArrowLeftRight, description: 'Modify customer services' },
    { id: 'experts' as TabType, label: 'Edit Expert', icon: Users, description: 'Select preferred expert' },
    { id: 'summary' as TabType, label: 'Exchange Summary', icon: Receipt, description: 'Review & confirm' },
    { id: 'history' as TabType, label: 'Transaction History', icon: History, description: 'View exchange logs' },
  ];

  const isTabComplete = (tab: TabType): boolean => {
    switch (tab) {
      case 'exchange':
        return selectedServices.length > 0;
      case 'experts':
        return true;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-3xl p-0 bg-white border-zinc-200">
        <DialogTitle className="sr-only">Exchange Services</DialogTitle>
        
        <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          

          {/* Modern Tab Bar */}
          <div className="px-6 pt-6 pb-2">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pb-6">
            {/* Main Form Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
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
                        <h2 className="text-xl font-semibold text-slate-800">Add New Services (Exchange)</h2>
                        <p className="text-sm text-slate-500">Select services to exchange with original purchase</p>
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
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/30"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-slate-50/30 appearance-none cursor-pointer"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Available Services Grid */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-slate-700 mb-3">Available Services</p>
                      <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
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
                        <p className="text-sm font-medium text-slate-700">Selected Exchange Services</p>
                        {selectedServices.length > 0 && (
                          <button onClick={clearAllServices} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                            <Trash2 className="w-3 h-3" />
                            Clear All
                          </button>
                        )}
                      </div>
                      
                      {selectedServices.length > 0 ? (
                        <div className="space-y-2 bg-slate-100 p-3 max-h-[15rem] overflow-y-scroll scrollbar-thin">
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
                          <p className="text-slate-400">No services selected for exchange</p>
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
                                <span className="font-semibold">${originalTotal}</span>
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
                        <h2 className="text-xl font-semibold text-slate-800">Exchange Expert</h2>
                        <p className="text-sm text-slate-500">Select a preferred expert for the exchanged services (optional)</p>
                      </div>
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
                        {availableExperts.map((expert) => {
                          const isSelected = selectedExpert?.id === expert.id;
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
                                {isSelected && expert.available && (
                                  <div className="absolute top-3 right-3 z-10">
                                    <CheckCircle className="w-6 h-6 text-blue-500 bg-white rounded-full" />
                                  </div>
                                )}
                                <div className="p-4">
                                  <div className="flex items-center gap-3 mb-3">
                                    <ServiceImage src={expert.image} alt={expert.name} className="w-16 h-16 rounded-xl object-cover" />
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-slate-800">{expert.name}</h3>
                                      <p className="text-xs text-blue-600">{expert.role}</p>
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
                        })}
                      </div>

                      <button
                        onClick={handleScrollRight}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>

                    {selectedExpert && (
                      <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-3">
                          <ServiceImage src={selectedExpert.image} alt={selectedExpert.name} className="w-14 h-14 rounded-xl object-cover" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-700">Selected Expert</span>
                            </div>
                            <p className="font-semibold text-slate-800 mt-1">{selectedExpert.name}</p>
                            <p className="text-sm text-slate-500">{selectedExpert.role}</p>
                          </div>
                          <button onClick={() => setSelectedExpert(null)} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
                            <Trash2 className="w-3 h-3" />
                            Deselect
                          </button>
                        </div>
                      </div>
                    )}

                    {!selectedExpert && (
                      <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">No expert selected. You can skip this step or choose an expert above.</span>
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
                        <h2 className="text-xl font-semibold text-slate-800">Exchange Summary</h2>
                        <p className="text-sm text-slate-500">Review exchange details before confirming</p>
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
                          <span className="font-semibold">${originalTotal}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-600">New Services Total</span>
                          <span className="font-semibold text-blue-600">${newTotal}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-600">Amount Paid</span>
                          <span className="font-semibold">${originalTotal}</span>
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

                      {selectedExpert && (
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-slate-700">Assigned Expert</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <ServiceImage src={selectedExpert.image} alt={selectedExpert.name} className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                              <p className="font-medium text-slate-800">{selectedExpert.name}</p>
                              <p className="text-xs text-slate-500">{selectedExpert.role}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-slate-600">{selectedExpert.rating} ({selectedExpert.reviewCount} reviews)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-slate-50 rounded-xl">
                        <h3 className="font-medium text-slate-800 mb-3">New Services</h3>
                        <div className="space-y-2">
                          {selectedServices.map((service) => (
                            <div key={service.id} className="flex justify-between text-sm">
                              <span className="text-slate-600">{service.name} x{service.quantity}</span>
                              <span className="font-medium">${service.price * service.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-xl">
                        <h3 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                          How Exchange Works
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
                               'Generate new receipt for exchange'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">5</div>
                            <span>Confirm exchange once settled</span>
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
                        <p className="text-sm text-slate-500">All exchange transactions are logged for transparency</p>
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
                                <p className="font-medium text-slate-800">Service Exchange</p>
                                <p className="text-xs text-slate-500">{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</p>
                              </div>
                            </div>
                            <span className={`font-semibold text-${currentExchange.color}-600`}>
                              {exchangeType === 'add_more' ? `+$${additionalAmount}` : 
                               exchangeType === 'refund' ? `-$${refundAmount}` : 
                               'Exchange'}
                            </span>
                          </div>
                          <div className="pl-10 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Exchange ID</span>
                              <span className="font-mono text-xs">EXC-{Math.floor(Math.random() * 90000) + 10000}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Exchange Type</span>
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
                          <p className="text-sm text-slate-500">No exchange initiated yet</p>
                          <p className="text-xs text-slate-400">Select services to start exchange</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between">
                  <button
                    onClick={goToPrevTab}
                    className={`px-5 py-2 rounded-xl font-medium transition ${
                      tabs.findIndex(t => t.id === activeTab) > 0
                        ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'opacity-50 cursor-not-allowed bg-white border border-slate-200 text-slate-400'
                    }`}
                    disabled={tabs.findIndex(t => t.id === activeTab) === 0}
                  >
                    Previous
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
                          Confirm Exchange
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 sticky top-6">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-800">Exchange Preview</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Real-time exchange summary</p>
                </div>
                
                <div className="p-5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Original Total</span>
                    <span className="font-semibold">${originalTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">New Total</span>
                    <span className="font-semibold text-blue-600">${newTotal}</span>
                  </div>

                  {selectedExpert && (
                    <div className="pt-2">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Assigned Expert</p>
                      <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-lg">
                        <ServiceImage src={selectedExpert.image} alt={selectedExpert.name} className="w-8 h-8 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-medium text-slate-700 text-xs">{selectedExpert.name}</p>
                          <p className="text-slate-500 text-xs">{selectedExpert.role}</p>
                        </div>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-slate-600">{selectedExpert.rating}</span>
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

        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default ExchangeModal;