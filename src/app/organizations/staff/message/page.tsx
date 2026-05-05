// FILE: app/message/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Star, 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  ArrowLeft,
  Check,
  CheckCheck,
  User,
  Award,
  Clock,
  Calendar,
  CreditCard,
  ChevronRight,
  Play,
  X,
  MessageCircle,
  Heart,
  Share2,
  Flag,
  Volume2,
  Image as ImageIcon,
  Smile,
  Paperclip
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Types
interface Message {
  id: string;
  text: string;
  sender: "user" | "expert";
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

interface Service {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
}

// Sample Data
const expertData = {
  id: "1",
  name: "Georgina Kate",
  role: "Certified Hairdresser",
  rating: 4.9,
  reviews: 119,
  experience: "10 Years",
  imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400",
  videoUrl: "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE",
  isOnline: true,
  bio: "Professional hairdresser with 10+ years of experience. Specialized in modern haircuts and styling."
};

const menuItems: MenuItem[] = [
  { id: "1", name: "Hair Cut", price: 80, description: "Professional haircut and styling" },
  { id: "2", name: "Beard Styling", price: 45, description: "Beard trim and shape" },
  { id: "3", name: "Manicure", price: 45, description: "Complete nail care" },
  { id: "4", name: "Shaving", price: 22, description: "Traditional hot towel shave" },
  { id: "5", name: "Hair Coloring", price: 120, description: "Full hair color service" },
  { id: "6", name: "Head Massage", price: 35, description: "Relaxing head and scalp massage" },
];

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hi Suraj\n+91 98265 5999",
    sender: "expert",
    timestamp: "7 mins",
    status: "read"
  },
  {
    id: "2",
    text: "Hello!\nCan I get service?",
    sender: "user",
    timestamp: "7 mins",
    status: "read"
  },
  {
    id: "3",
    text: "Sure, What are you after?",
    sender: "expert",
    timestamp: "5 mins",
    status: "read"
  },
  {
    id: "4",
    text: "Hi Suraj",
    sender: "expert",
    timestamp: "5 mins",
    status: "read"
  },
  {
    id: "5",
    text: "Manicure, Haircut & Shaving",
    sender: "user",
    timestamp: "4 mins",
    status: "read"
  },
  {
    id: "6",
    text: "OK! I will add services & book you now :)",
    sender: "expert",
    timestamp: "3 mins",
    status: "read"
  }
];

const StarRating = ({ rating, reviews }: { rating: number; reviews: number }) => (
  <div className="flex items-center gap-1">
    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{rating}</span>
    <span className="text-xs text-zinc-500 dark:text-zinc-400">★★★★★({reviews} Public Reviews)</span>
  </div>
);

const MessageStatus = ({ status }: { status: string }) => {
  if (status === "sent") return <Check className="w-3 h-3 text-zinc-400" />;
  if (status === "delivered") return <CheckCheck className="w-3 h-3 text-zinc-400" />;
  if (status === "read") return <CheckCheck className="w-3 h-3 text-blue-500" />;
  return null;
};

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Video Modal Component
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
          className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/50 rounded-full p-2 transition-colors hover:bg-black/70 cursor-pointer"
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

export default function MessagePage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedServicesList = menuItems.filter(s => selectedServices.includes(s.id));
  const totalAmount = selectedServicesList.reduce((sum, service) => sum + service.price, 0);
  const gst = Math.round(totalAmount * 0.05);
  const totalWithGst = totalAmount + gst;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: "Just now",
      status: "sent"
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");
    
    setTimeout(() => {
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! I'll help you with the booking.",
        sender: "expert",
        timestamp: "Just now",
        status: "read"
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePlayVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (expertData.videoUrl) {
      setIsVideoModalOpen(true);
    }
  };

  const handleBookNow = () => {
    if (selectedServicesList.length === 0) {
      alert("Please select at least one service");
      return;
    }
    alert(`Booking confirmed! Total: $${totalWithGst} USD`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
            <Link href="/organizations" className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer">  
            <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Messages</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN - Staff Profile with Play Button */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden sticky top-6">
              {/* Profile Image with Play Button */}
              <div className="relative aspect-square w-full cursor-pointer group overflow-hidden h-50">
                {!imageError && expertData.imageUrl ? (
                  <>
                    <Image
                      src={expertData.imageUrl}
                      alt={expertData.name}
                      fill
                      className="object-cover transition-transform duration-500 "
                      onError={() => setImageError(true)}
                    />
                    {/* Play Button Overlay */}
                    <button
                      onClick={handlePlayVideo}
                      className="absolute inset-0 flex items-center justify-center  transition-all duration-300 cursor-pointer"
                    >
                      <div className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full p-4 transition-all duration-300 hover:scale-110 opacity-100 cursor-pointer">
                        <Play className="w-8 h-8 fill-white text-white " />
                      </div>
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <User className="w-20 h-20 text-white" />
                  </div>
                )}
              </div>

              {/* Staff Info */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{expertData.name}</h3>
                  {expertData.isOnline && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Online</span>
                    </div>
                  )}
                </div>
                
                <p className="text-md text-indigo-600 dark:text-indigo-400 mb-3">{expertData.role}</p>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{expertData.experience} Experience</span>
                  </div>
                </div>
                
                <StarRating rating={expertData.rating} reviews={expertData.reviews} />
                
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  {expertData.bio}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-300 cursor-pointer">
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 transition-all duration-300 cursor-pointer">
                    <Video className="w-4 h-4" />
                    Video
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN - Chat UI */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col max-h-[33.5rem]">
              
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
                      {expertData.imageUrl && !imageError ? (
                        <Image
                          src={expertData.imageUrl}
                          alt={expertData.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    {expertData.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Chat with {expertData.name}</h3>
                    <p className="text-xs text-green-600">Usually responds in a few minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer">
                    <Phone className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </button>
                  <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer">
                    <MoreVertical className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-scroll p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === "user"
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        message.sender === "user" ? "text-indigo-200" : "text-zinc-400"
                      }`}>
                        <span>{message.timestamp}</span>
                        {message.sender === "user" && message.status && (
                          <MessageStatus status={message.status} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer">
                    <Paperclip className="w-5 h-5 text-zinc-500" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Write a message..."
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white placeholder:text-zinc-400"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-xl transition-all duration-300 cursor-pointer"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Menu & Total */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Menu Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Services Menu</h3>
                <p className="text-sm text-zinc-500 mt-1">Select services you want to book</p>
              </div>
              
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-[10rem] overflow-y-scroll scrollbar-hide">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (selectedServices.includes(item.id)) {
                        setSelectedServices(selectedServices.filter(id => id !== item.id));
                      } else {
                        setSelectedServices([...selectedServices, item.id]);
                      }
                    }}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                      selectedServices.includes(item.id) ? "bg-indigo-50 dark:bg-indigo-950/30" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-zinc-900 dark:text-white">{item.name}</h4>
                        {item.description && (
                          <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">${item.price}</p>
                        {selectedServices.includes(item.id) && (
                          <Check className="w-5 h-5 text-indigo-600 mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm sticky top-6">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Order Summary</h3>

              <div className="max-h-[7rem] overflow-y-scroll scrollbar-hide">
              
              {/* Selected Services */}
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {selectedServicesList.map((service) => (
                  <div key={service.id} className="flex justify-between items-center text-sm">
                    <span className="text-zinc-700 dark:text-zinc-300">{service.name}</span>
                    <span className="font-semibold text-indigo-600">${service.price}</span>
                  </div>
                ))}
                {selectedServicesList.length === 0 && (
                  <p className="text-center text-zinc-500 py-4 text-sm">No services selected</p>
                )}
              </div>

              {selectedServicesList.length > 0 && (
                <>
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
                    <span className="text-zinc-900 dark:text-white">${totalAmount}</span>
                  </div>
                  
                  {/* GST */}
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-zinc-600 dark:text-zinc-400">GST (5%)</span>
                    <span className="text-zinc-900 dark:text-white">${gst}</span>
                  </div>
                  
                  {/* Total */}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-lg font-bold text-zinc-900 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-indigo-600">${totalWithGst}</span>
                  </div>

                  {/* Date & Time Placeholder */}
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        <span className="text-zinc-600 dark:text-zinc-400">12 April</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span className="text-zinc-600 dark:text-zinc-400">3:00 PM – 7:00 PM</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              </div>

              {/* Book Button */}
              <button 
                onClick={handleBookNow}
                className="w-full mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg cursor-pointer"
              >
                Book & Pay {totalWithGst > 0 && `$${totalWithGst} USD`}
              </button>

              {/* <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-500">
                <span>💳 Secure payment</span>
                <span>•</span>
                <span>✅ Instant confirmation</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={expertData.videoUrl || ""}
        title={`${expertData.name} - Introduction Video`}
      />
    </div>
  );
}