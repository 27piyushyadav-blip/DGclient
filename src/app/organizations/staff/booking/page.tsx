// FILE: app/booking/page.tsx
"use client";

import { useState } from "react";
import { 
  Search, 
  Star, 
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Apple,
  Wallet,
  Zap,
  Check,
  User,
  Calendar,
  Clock,
  MessageCircle,
  Video,
  Shield,
  Award,
  Phone,
  Play,
  X
} from "lucide-react";
import Image from "next/image";


// Add this helper function before the component
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Add Video Modal Component before your main component
const VideoModal = ({ isOpen, onClose, videoUrl, title }: { isOpen: boolean; onClose: () => void; videoUrl: string; title: string }) => {
  const videoId = getYouTubeVideoId(videoUrl);
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/50 rounded-full p-2 transition-colors hover:bg-black/70"
        >
          <X className="w-6 h-6" />
        </button>
        
        {videoId ? (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          </div>
        ) : (
          <div className="aspect-video flex items-center justify-center bg-zinc-900">
            <p className="text-white">Video not available</p>
          </div>
        )}
      </div>
    </div>
  );
};


// Types
interface Service {
  id: string;
  name: string;
  price: number;
  duration?: string;
  rating: number;
  reviews: number;
  imageUrl?: string
}

// interface Expert {
//   id: string;
//   name: string;
//   role: string;
//   rating: number;
//   reviews: number;
//   experience: string;
//   price: number;
//   isCertified: boolean;
// }

interface Expert {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  experience: string;
  price: number;
  isCertified: boolean;
  videoUrl?: string;
  imageUrl?: string;
}

// Sample Data
const servicesData: Service[] = [
  { id: "1", name: "Hair Cut", price: 80, rating: 4.8, reviews: 145, imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=100&h=100" },
  { id: "2", name: "Beard Styling", price: 45, rating: 4.7, reviews: 119, imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=100&h=100" },
  { id: "3", name: "Trimming", price: 50, rating: 4.6, reviews: 87, imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=100&h=100" },
  { id: "4", name: "Cleaning", price: 60, rating: 4.9, reviews: 92, imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=100&h=100" },
  { id: "5", name: "Hair Wash", price: 30, rating: 4.5, reviews: 56, imageUrl: "https://images.unsplash.com/photo-1560869713-7d0a29430872?auto=format&fit=crop&q=80&w=100&h=100" },
  { id: "6", name: "Hair Coloring", price: 120, rating: 4.8, reviews: 103, imageUrl: "https://images.unsplash.com/photo-1560066984-138dad7fe58b?auto=format&fit=crop&q=80&w=100&h=100" },
  { id: "7", name: "Head Massage", price: 35, rating: 4.7, reviews: 78, imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=100&h=100" },
];

const expertsData: Expert[] = [
  { id: "1", name: "Georgina Kate", role: "Certified Hairdresser", rating: 4.9, reviews: 145, experience: "10 yrs", price: 80, isCertified: true,
    videoUrl: "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400"
   },
  { id: "2", name: "Daniel Cruz", role: "Senior Stylist", rating: 4.8, reviews: 119, experience: "8 yrs", price: 75, isCertified: true,
    videoUrl: "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400"
   },
  { id: "3", name: "Amelia Levantine", role: "Hair Colorist", rating: 4.7, reviews: 87, experience: "6 yrs", price: 85, isCertified: true,
    videoUrl: "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400"
   },
  { id: "4", name: "Sophia Miller", role: "Beard Specialist", rating: 4.9, reviews: 110, experience: "9 yrs", price: 70, isCertified: true,
    videoUrl: "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400"
   },
  { id: "5", name: "Michael Brooks", role: "Master Barber", rating: 4.8, reviews: 92, experience: "15 yrs", price: 90, isCertified: true,
    videoUrl: "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400"
   },
];



const StarRating = ({ rating, reviews }: { rating: number; reviews: number }) => (
  <div className="flex items-center gap-1">
    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{rating}</span>
    <span className="text-xs text-zinc-500 dark:text-zinc-400">★★★★★({reviews})</span>
  </div>
);

export default function BookingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<string>("1");
  const [selectedDate, setSelectedDate] = useState("12 April");
  const [selectedTime, setSelectedTime] = useState("3:00 PM");
  const [paymentMethod, setPaymentMethod] = useState("card");
  // Add state in your main component (inside BookingPage function)
const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
const [videoUrl, setVideoUrl] = useState("");
const [videoTitle, setVideoTitle] = useState("");
const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

// Add handler function
const handlePlayVideo = (e: React.MouseEvent, expert: Expert) => {
  e.preventDefault();
  e.stopPropagation();
  if (expert.videoUrl) {
    setVideoUrl(expert.videoUrl);
    setVideoTitle(`${expert.name} - Introduction Video`);
    setIsVideoModalOpen(true);
  }
};

const handleImageError = (expertId: string) => {
  setImageErrors(prev => ({ ...prev, [expertId]: true }));
};

  const filteredServices = servicesData.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedServicesList = servicesData.filter(s => selectedServices.includes(s.id));
  const selectedExpertData = expertsData.find(e => e.id === selectedExpert);
  const totalAmount = selectedServicesList.reduce((sum, service) => sum + service.price, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center max-w-2xl mx-auto mb-4 gap-5">

             <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white rounded-lg hover:bg-[var(--hover-primary-color)] transition-all cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
            Back
          </button>

            <div className="flex  justify-between max-w-2xl mx-auto">
          {["Select Services", "Select Expert", "Date & Time", "Payment"].map((step, idx) => (
            <div key={idx} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  idx < 2 ? "bg-[var(--primary-color)] text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                }`}>
                  {idx + 1}
                </div>
                <span className="text-xs mt-1 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{step}</span>
              </div>
              {idx < 3 && (
                <div className="w-16 h-0.5 bg-zinc-200 dark:bg-zinc-800 mx-2" />
              )}
            </div>
          ))}
          </div>

          <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white rounded-lg hover:[var(--hover-primary-color)] transition-all cursor-pointer">
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN - Selected Staff Info + Services */}
          <div className="lg:col-span-5 space-y-4">           
            {selectedExpertData && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="flex">
                {/* Image Section with Play Button Overlay */}
                <div className="relative w-60 h-35 flex-shrink-0 cursor-pointer group overflow-hidden">
                    {!imageErrors[selectedExpertData.id] && selectedExpertData.imageUrl ? (
                    <>
                        <Image
                        src={selectedExpertData.imageUrl}
                        alt={selectedExpertData.name}
                        fill
                        className="object-cover transition-transform duration-500"
                        onError={() => handleImageError(selectedExpertData.id)}
                        />
                        {/* Play Button Overlay */}
                        <button
                        onClick={(e) => handlePlayVideo(e, selectedExpertData)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300"
                        >
                        <div className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:scale-110 opacity-100">
                            <Play className="w-6 h-6 fill-white text-white" />
                        </div>
                        </button>
                    </>
                    ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                    </div>
                    )}
                </div>
                
                {/* Staff Info */}
                <div className="flex-1 py-3.5 px-4">
                    <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{selectedExpertData.name}</h3>
                    </div>
                    <p className="text-sm text-[var(--primary-color)] dark:text-[var(--primary-color)] mb-2">{selectedExpertData.role}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-600">
                    <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {selectedExpertData.experience} Experience
                    </span>
                    <span className="font-semibold text-[var(--primary-color)]">${selectedExpertData.price}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                    <StarRating rating={selectedExpertData.rating} reviews={selectedExpertData.reviews} />
                    </div>
                </div>
                </div>
            </div>
            )}

            {/* Choose Your Services - BELOW Staff Card */}
<div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
  <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Choose Your Services</h2>
      <div className="relative w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Find service"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>
    </div>
    
    {/* Filter Buttons */}
    <div className="flex gap-2">
      {["Select All", "Top Rated", "Price Low-High", "Experience"].map((filter) => (
        <button
          key={filter}
          className="px-3 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-colors"
        >
          {filter}
        </button>
      ))}
    </div>
  </div>

  {/* Services List */}
  <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-[15rem] overflow-y-auto">
    {filteredServices.map((service) => (
      <div
        key={service.id}
        onClick={() => {
          if (selectedServices.includes(service.id)) {
            setSelectedServices(selectedServices.filter(id => id !== service.id));
          } else {
            setSelectedServices([...selectedServices, service.id]);
          }
        }}
        className={`p-4 cursor-pointer transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
          selectedServices.includes(service.id) ? "bg-indigo-50 dark:bg-indigo-950/30" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Service Image */}
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 flex-shrink-0">
            {service.imageUrl ? (
              <Image
                src={service.imageUrl}
                alt={service.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Service Info */}
          <div className="flex-1">
            <h4 className="font-semibold text-zinc-900 dark:text-white">{service.name}</h4>
            <StarRating rating={service.rating} reviews={service.reviews} />
          </div>
          
          {/* Price & Selection */}
          <div className="text-right">
            <p className="text-lg font-bold text-[var(--primary-color)] dark:text-[var(--primary-color)]">${service.price}</p>
            {selectedServices.includes(service.id) && (
              <Check className="w-5 h-5 text-[var(--hover-primary-color)] mt-1 ml-auto" />
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
          </div>

          {/* MIDDLE COLUMN - All Staff List */}
          <div className="lg:col-span-4 ">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Choose Your Expert</h2>
                <p className="text-sm text-zinc-500 mt-1">Select from our professional stylists</p>
              </div>

              {/* Experts List */}
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-[26rem] overflow-y-scroll">
                {expertsData.map((expert) => (
                <div
                    key={expert.id}
                    onClick={() => setSelectedExpert(expert.id)}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                    selectedExpert === expert.id ? "bg-indigo-50 dark:bg-indigo-950/30" : ""
                    }`}
                >
                    <div className="flex gap-3">
                    {/* Expert Image with Play Button */}
                    <div className="relative flex-shrink-0 group">
                        <div 
                        className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                        >
                        {!imageErrors[expert.id] && expert.imageUrl ? (
                            <Image
                            src={expert.imageUrl}
                            alt={expert.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(expert.id)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                            <User className="w-7 h-7 text-white" />
                            </div>
                        )}
                        </div>
                        
                        {/* Small Play Button Overlay */}
                        {expert.videoUrl && (
                        <button
                            onClick={(e) => handlePlayVideo(e, expert)}
                            className="absolute -bottom-[-3px] -right-1 w-6 h-6 bg-[var(--primary-color)] rounded-full flex items-center justify-center shadow-lg hover:bg-[var(--hover-primary-color)] transition-all hover:scale-110 cursor-pointer"
                        >
                            <Play className="w-3 h-3 fill-white text-white" />
                        </button>
                        )}
                        
                        {expert.isCertified && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                        </div>
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-zinc-900 dark:text-white">{expert.name}</h4>
                        <StarRating rating={expert.rating} reviews={expert.reviews} />
                        </div>
                        <p className="text-sm text-[var(--primary-color)] dark:text-[var(--primary-color)] mb-1">{expert.role}</p>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span>⭐ {expert.experience}</span>
                        <span>💰 ${expert.price}/hr</span>
                        </div>
                    </div>
                    </div>
                </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Your Booking + Payment */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Your Booking Summary */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm ">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Your Booking</h3>

              <div className="max-h-[8rem] overflow-y-scroll scroll-smooth scrollbar-hide">
              
              {/* Selected Services */}
              <div className="space-y-3 mb-4">
                {selectedServicesList.map((service) => (
                  <div key={service.id} className="flex justify-between items-center">
                    <span className="text-zinc-700 dark:text-zinc-300">{service.name}</span>
                    <span className="font-semibold text-[var(--primary-color)]">${service.price}</span>
                  </div>
                ))}
                {selectedServicesList.length === 0 && (
                  <p className="text-center text-zinc-500 py-4 text-sm">No services selected</p>
                )}
              </div>

              {/* Date & Time */}
              <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600">Total:</span>
                  <span className="font-bold text-[var(--primary-color)]">{selectedDate}</span>
                  <span className="text-zinc-600">{selectedTime}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                  <span>📞 +03599800/1009</span>
                  <span>📞 +403593800/1009</span>
                </div>
              </div>
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-zinc-900 dark:text-white">Total:</span>
                  <span className="text-2xl font-bold text-[var(--primary-color)]">${totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm ">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Payment Method</h3>
              <div className="max-h-[5.5rem] overflow-y-scroll scroll-smooth scrollbar-hide">
              
              <div className="space-y-3">
                {[
                  { id: "card", label: "Card Payment", icon: CreditCard, details: "1234567890123456 16 12/25 123" },
                  { id: "apple", label: "Apple/Google Pay", icon: Apple, details: "" },
                  { id: "paylater", label: "Pay Later", icon: Zap, details: "" },
                  { id: "wallet", label: "Wallet/Credits", icon: Wallet, details: "$136" },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === method.id
                        ? "border-[var(--hover-primary-color)] bg-indigo-50 dark:bg-indigo-950/30"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-[var(--primary-color)]"
                    />
                    <method.icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    <div className="flex-1">
                      <span className="font-medium text-zinc-900 dark:text-white">{method.label}</span>
                      {method.details && (
                        <p className="text-xs text-zinc-500 mt-1">{method.details}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              </div>

              {/* Additional Options */}
              {/* <div className="mt-4 pt-4 space-y-2 border-t border-zinc-200 dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-zinc-700 dark:text-zinc-300">Chat with expert before booking</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-zinc-700 dark:text-zinc-300">Video-consultation option</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-zinc-700 dark:text-zinc-300">Instant booking/Request approval</span>
                </label>
              </div> */}

              {/* Confirm Button */}
              <button 
                onClick={() => {
                  if (selectedServicesList.length === 0) {
                    alert("Please select at least one service");
                    return;
                  }
                  alert("Booking confirmed successfully!");
                }}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg cursor-pointer"
              >
                Confirm & Pay
              </button>

              {/* <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-500">
                <Shield className="w-3 h-3" />
                <span>Secure payment guaranteed</span>
              </div> */}

            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {/* <div className="flex justify-between mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 transition-all">
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all">
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div> */}
      </div>
      <VideoModal
  isOpen={isVideoModalOpen}
  onClose={() => setIsVideoModalOpen(false)}
  videoUrl={videoUrl}
  title={videoTitle}
/>
    </div>
  );
}