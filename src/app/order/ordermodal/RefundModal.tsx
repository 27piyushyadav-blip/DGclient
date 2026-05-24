// RefundModal.tsx
import React, { useState } from 'react';
import {
  Flag,
  Star,
  DollarSign,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Clock,
  CreditCard,
  Wallet,
  Upload,
  Trash2,
  Image,
  Video,
  File,
  X,
  ChevronRight,
  ChevronLeft,
  Minus,
  Plus,
  RefreshCw,
  Eye,
  Receipt,
  Sparkles,
  MinusCircle,
  PlusCircle,
  ArrowLeft
} from 'lucide-react';

type RefundReason = 
  | 'not_as_described'
  | 'unprofessional_behavior'
  | 'did_not_receive'
  | 'poor_hygiene'
  | 'other';

type Service = {
  id: string;
  name: string;
  duration: string;
  price: number;
  image: string;
};

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

type TabType = 'reason' | 'feedback' | 'summary';

const originalServices: Service[] = [
  { id: '1', name: 'Swedish Massage', duration: '60 min', price: 150, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop' },
  { id: '2', name: 'Hair Styling', duration: '45 min', price: 100, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&h=150&fit=crop' },
];

function ServiceImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200 text-blue-600`}
      >
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
}


interface ExchangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RefundModal = ({
  open,
  onOpenChange,
}: ExchangeModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('reason');
  const [selectedReason, setSelectedReason] = useState<RefundReason>('did_not_receive');
  const [additionalNotes, setAdditionalNotes] = useState('Customer mentioned that the massage was too rough and caused discomfort.');
  const [rating, setRating] = useState(3);
  const [customerFeedback, setCustomerFeedback] = useState('The massage pressure was too high and the therapist ignored my request to reduce it. Not satisfied with the service.');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refundConfirmed, setRefundConfirmed] = useState(false);

  const totalPaid = 250;
  const processingFee = refundType === 'full' ? totalPaid * 0.02 : partialAmount * 0.02;
  const refundAmount = refundType === 'full' ? totalPaid : partialAmount;
  const totalRefund = refundAmount - processingFee;

  const refundReasons = [
    { id: 'not_as_described', label: 'Service was not as described', icon: FileText },
    { id: 'unprofessional_behavior', label: 'Therapist behavior was unprofessional', icon: User },
    { id: 'did_not_receive', label: 'Did not receive the service', icon: Clock },
    { id: 'poor_hygiene', label: 'Poor hygiene / Cleanliness', icon: AlertCircle },
    { id: 'other', label: 'Other', icon: Flag },
  ];

  const tabs = [
    { id: 'reason' as TabType, label: 'Refund Reason', icon: Flag, description: 'Select cancellation reason' },
    { id: 'feedback' as TabType, label: 'Service Feedback', icon: Star, description: 'Rate your experience' },
    { id: 'summary' as TabType, label: 'Refund Summary', icon: DollarSign, description: 'Review & confirm' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      const newFiles: UploadedFile[] = Array.from(uploadedFiles).map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const newFiles: UploadedFile[] = Array.from(droppedFiles).map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleProcessRefund = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setRefundConfirmed(true);
      setTimeout(() => {
        setRefundConfirmed(false);
        onOpenChange(false);
      }, 2000);
    }, 1500);
  };

  const isTabComplete = (tab: TabType): boolean => {
    switch (tab) {
      case 'reason':
        return selectedReason !== null;
      case 'feedback':
        return true;
      case 'summary':
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

  const handlePartialAmountChange = (value: string) => {
    const numericValue = Number(value);

    if (value === '') {
      setPartialAmount(0);
      return;
    }

    if (Number.isNaN(numericValue)) {
      return;
    }

    setPartialAmount(Math.max(0, Math.min(totalPaid, numericValue)));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition z-10"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>

          <div className="p-6 md:p-8">

            {/* Modern Tab Bar */}
            <div className="mb-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form Panel */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                  {/* Original Purchased Services - Show on all tabs */}
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
                          <ServiceImage
                            src={service.image}
                            alt={service.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-slate-800 text-sm">{service.name}</p>
                            <p className="text-xs text-slate-500">{service.duration}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-800">${service.price}</p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                        <span className="font-semibold text-slate-800">Total Paid</span>
                        <span className="text-xl font-bold text-blue-600">${totalPaid}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reason Tab */}
                  {activeTab === 'reason' && (
                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Flag className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-800">Reason for Refund</h2>
                          <p className="text-sm text-slate-500">Select the reason for refund request</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        {refundReasons.map((reason) => {
                          const Icon = reason.icon;
                          const isSelected = selectedReason === reason.id;
                          return (
                            <label
                              key={reason.id}
                              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50/50'
                                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="refundReason"
                                value={reason.id}
                                checked={isSelected}
                                onChange={() => setSelectedReason(reason.id as RefundReason)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                              />
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                              <span className={`flex-1 ${isSelected ? 'text-blue-700 font-medium' : 'text-slate-700'}`}>
                                {reason.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/30"
                          placeholder="Add any additional details about the refund request..."
                        />
                      </div>

                      {/* File Upload */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Supporting Documents (Optional)
                        </label>
                        <p className="text-xs text-slate-400 mb-2">JPG, PNG, MP4 up to 10MB</p>
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-4 text-center transition ${
                            isDragging
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-blue-300 bg-slate-50/30'
                          }`}
                        >
                          <input
                            type="file"
                            id="fileUpload"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <label htmlFor="fileUpload" className="cursor-pointer block">
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600">Drag & drop files here or click to upload</p>
                          </label>
                        </div>

                        {files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {files.map((file) => (
                              <div key={file.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                {getFileIcon(file.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                                  <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                                </div>
                                <button
                                  onClick={() => removeFile(file.id)}
                                  className="text-slate-400 hover:text-red-500 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Feedback Tab */}
                  {activeTab === 'feedback' && (
                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Star className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-800">Service Feedback</h2>
                          <p className="text-sm text-slate-500">Share your experience with the service</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-sm font-medium text-slate-700 mb-3">How would you rate your experience?</p>
                        <div className="flex gap-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-10 h-10 ${
                                  star <= rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Customer Feedback (Optional)
                        </label>
                        <textarea
                          value={customerFeedback}
                          onChange={(e) => setCustomerFeedback(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/30"
                          placeholder="Share your experience with the service..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Summary Tab */}
                  {activeTab === 'summary' && (
                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-800">Refund Summary</h2>
                          <p className="text-sm text-slate-500">Review refund details before processing</p>
                        </div>
                      </div>

                      {/* Full Refund Eligible Badge */}
                      <div className="mb-5 p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-700">Full Refund Eligible</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">Based on the issue, full refund is applicable.</p>
                      </div>

                      {/* Refund Type Selection */}
                      <div className="flex gap-3 mb-5">
                        <button
                          onClick={() => setRefundType('full')}
                          className={`flex-1 py-2.5 rounded-xl font-medium transition ${
                            refundType === 'full'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Full Refund
                        </button>
                        <button
                          onClick={() => setRefundType('partial')}
                          className={`flex-1 py-2.5 rounded-xl font-medium transition ${
                            refundType === 'partial'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Partial Refund
                        </button>
                      </div>

                      {/* Refund Calculations */}
                      <div className="space-y-3 p-4 bg-slate-50 rounded-xl mb-5">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Total Paid by Customer</span>
                          <span className="font-semibold text-slate-800">${totalPaid}</span>
                        </div>
                        
                        {refundType === 'partial' && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Refund Amount</span>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setPartialAmount(Math.max(0, partialAmount - 10))}
                                className="w-8 h-8 rounded-full bg-white cursor-pointer flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition"
                              >
                                <Minus className='w-5 h-5'/>
                              </button>
                              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                                <span className="text-slate-500 mr-2">$</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={totalPaid}
                                  step={10}
                                  value={partialAmount}
                                  onChange={(e) => handlePartialAmountChange(e.target.value)}
                                  className="w-20 border-0 bg-transparent text-center text-lg font-semibold text-blue-600 outline-none"
                                />
                              </div>
                              <button
                                onClick={() => setPartialAmount(Math.min(totalPaid, partialAmount + 10))}
                                className="w-8 h-8 rounded-full bg-white cursor-pointer flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition"
                              >
                                <Plus className='w-5 h-5'/>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Processing Fee (2%)</span>
                          <span className="text-red-600">-${processingFee.toFixed(2)}</span>
                        </div>
                        
                        <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                          <span className="font-semibold text-slate-800">Total Refund to Customer</span>
                          <span className="text-2xl font-bold text-blue-600">${totalRefund.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Refund Method */}
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Refund Method</p>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-800">Original Payment Method (•••• 4242)</span>
                        </div>
                      </div>

                      {/* Important Note */}
                      <div className="mt-5 flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">
                          After processing the refund, the booking will be marked as Cancelled and 
                          the services will be removed from the schedule.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between">
                    <button
                      onClick={goToPrevTab}
                      className={`px-5 py-2 rounded-xl font-medium transition ${
                        tabs.findIndex(t => t.id === activeTab) > 0
                          ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed bg-white border border-slate-200 text-slate-400'
                      }`}
                      disabled={tabs.findIndex(t => t.id === activeTab) === 0}
                    >
                      Previous
                    </button>
                    {activeTab !== 'summary' ? (
                      <button
                        onClick={goToNextTab}
                        disabled={!isTabComplete(activeTab)}
                        className={`px-5 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
                          isTabComplete(activeTab)
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md cursor-pointer'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleProcessRefund}
                        disabled={isProcessing || refundConfirmed}
                        className={`px-5 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
                          !refundConfirmed
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-md cursor-pointer'
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
                            Process {refundType === 'full' ? 'Full' : 'Partial'} Refund
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Live Preview */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 sticky top-6">
                  <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-800">Refund Preview</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Real-time refund summary</p>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Order ID</p>
                        <p className="font-mono font-semibold text-slate-800 text-sm">#VO-28473</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Date</p>
                        <p className="text-xs text-slate-600">May 18, 2025</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Refund Reason</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Flag className="w-4 h-4 text-blue-500" />
                        <span className="text-slate-700">
                          {refundReasons.find(r => r.id === selectedReason)?.label}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Rating</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Total Paid</span>
                        <span className="font-semibold text-slate-800">${totalPaid}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-600">Processing Fee (2%)</span>
                        <span className="text-red-600">-${processingFee.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between font-semibold">
                        <span className="text-slate-800">Refund Amount</span>
                        <span className="text-xl font-bold text-blue-600">${totalRefund.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="w-3 h-3 text-blue-500" />
                        <span className="text-slate-600">Refund processed within 5-7 business days</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <CreditCard className="w-3 h-3 text-blue-500" />
                        <span className="text-slate-600">Refund to original payment method</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Wallet className="w-3 h-3 text-blue-500" />
                        <span className="text-slate-600">Booking cancelled after refund</span>
                      </div>
                    </div>

                    {refundConfirmed && (
                      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2.5 rounded-xl">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Refund processed successfully!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
