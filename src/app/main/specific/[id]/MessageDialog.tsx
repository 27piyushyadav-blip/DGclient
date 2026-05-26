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
  Play,
  Paperclip,
} from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import VideoModal from "@/components/modals/VideoModal";
import ChangeExpertDialog from "./ChangeExpertDialog";
import ProfileModal from "./ProfileModal";

// Types
interface Message {
  id: string;
  text: string;
  sender: "user" | "expert";
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

interface StaffMember {
  name: string;
  role: string;
  image: string;
  imageUrl?: string;
  [key: string]: any;
}

type NormalizedStaffMember = StaffMember & {
  imageUrl: string;
};

type MessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember;
  venueName: string;
  allStaff?: StaffMember[];
};

const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Hair Cut",
    price: 80,
    description: "Professional haircut and styling",
    imageUrl:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "2",
    name: "Beard Styling",
    price: 45,
    description: "Beard trim and shape",
    imageUrl:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "3",
    name: "Manicure",
    price: 45,
    description: "Complete nail care",
    imageUrl:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "4",
    name: "Shaving",
    price: 22,
    description: "Traditional hot towel shave",
    imageUrl:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "5",
    name: "Hair Coloring",
    price: 120,
    description: "Full hair color service",
    imageUrl:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "6",
    name: "Head Massage",
    price: 35,
    description: "Relaxing head and scalp massage",
    imageUrl:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=100&h=100",
  },
];

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hi Suraj\n+91 98265 5999",
    sender: "expert",
    timestamp: "7 mins",
    status: "read",
  },
  {
    id: "2",
    text: "Hello!\nCan I get service?",
    sender: "user",
    timestamp: "7 mins",
    status: "read",
  },
  {
    id: "3",
    text: "Sure, What are you after?",
    sender: "expert",
    timestamp: "5 mins",
    status: "read",
  },
  {
    id: "4",
    text: "Hi Suraj",
    sender: "expert",
    timestamp: "5 mins",
    status: "read",
  },
  {
    id: "5",
    text: "Manicure, Haircut & Shaving",
    sender: "user",
    timestamp: "4 mins",
    status: "read",
  },
  {
    id: "6",
    text: "OK! I will add services & book you now :)",
    sender: "expert",
    timestamp: "3 mins",
    status: "read",
  },
];

const StarRating = ({
  rating,
  reviews,
}: {
  rating: number;
  reviews: number;
}) => (
  <div className="flex items-center gap-1">
    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    <span className="text-sm font-semibold text-zinc-700">{rating}</span>
    <span className="text-xs text-zinc-500">
      ★★★★★({reviews} Public Reviews)
    </span>
  </div>
);

const MessageStatus = ({ status }: { status: string }) => {
  if (status === "sent") return <Check className="w-3 h-3 text-zinc-400" />;
  if (status === "delivered")
    return <CheckCheck className="w-3 h-3 text-zinc-400" />;
  if (status === "read")
    return <CheckCheck className="w-3 h-3 text-blue-500" />;
  return null;
};

export default function MessageDialog({
  open,
  onOpenChange,
  staff,
  venueName,
  allStaff = [],
}: MessageDialogProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isChangeExpertOpen, setIsChangeExpertOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Expert data with staff info
  const expertData = {
    id: staff.name,
    name: staff.name,
    role: staff.role,
    rating: 4.9,
    reviews: 119,
    experience: "10 Years",
    imageUrl: staff.image || staff.imageUrl || "",
    videoUrl: "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE",
    isOnline: true,
    bio: `Professional ${staff.role.toLowerCase()} with 10+ years of experience. Specialized in providing relaxing and rejuvenating treatments.`,
  };

  const normalizedStaff: NormalizedStaffMember = {
    ...staff,
    imageUrl: staff.imageUrl || staff.image || "",
  };

  const normalizedAllStaff: NormalizedStaffMember[] = allStaff.map(
    (expert) => ({
      ...expert,
      imageUrl: expert.imageUrl || expert.image || "",
    }),
  );

  const selectedServicesList = menuItems.filter((s) =>
    selectedServices.includes(s.id),
  );
  const totalAmount = selectedServicesList.reduce(
    (sum, service) => sum + service.price,
    0,
  );
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
      status: "sent",
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");

    setTimeout(() => {
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! I'll help you with the booking.",
        sender: "expert",
        timestamp: "Just now",
        status: "read",
      };
      setMessages((prev) => [...prev, replyMessage]);
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
      onOpenChange(false);
      window.setTimeout(() => {
        setIsVideoModalOpen(true);
      }, 0);
    }
  };

  const handleBookNow = () => {
    if (selectedServicesList.length === 0) {
      alert("Please select at least one service");
      return;
    }
    alert(`Booking confirmed at ${venueName}! Total: $${totalWithGst} USD`);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 overflow-hidden rounded-2xl bg-zinc-50 border-zinc-200">
          <DialogTitle className="sr-only">Chat with {staff.name}</DialogTitle>

          <div className="min-h-full bg-zinc-50">
            <div className="container mx-auto max-w-7xl px-4 py-6 h-full flex flex-col">
              {/* Header with Back Button */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 text-zinc-600" />
                </button>
                <h1 className="text-2xl font-bold text-zinc-900">Messages</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                {/* LEFT COLUMN - Staff Profile with Play Button */}
                <div className="lg:col-span-4">
                  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden sticky top-6">
                    {/* Profile Image with Play Button */}
                    <div className="relative aspect-square w-full cursor-pointer group overflow-hidden h-[12rem]">
                      {!imageError && expertData.imageUrl ? (
                        <>
                          <Image
                            src={expertData.imageUrl}
                            alt={expertData.name}
                            fill
                            className="object-cover transition-transform duration-500"
                            onError={() => setImageError(true)}
                          />
                          {/* Play Button Overlay */}
                          <button
                            onClick={handlePlayVideo}
                            className="absolute inset-0 flex items-center justify-center transition-all duration-300 cursor-pointer"
                          >
                            <div className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full p-4 transition-all duration-300 hover:scale-110 opacity-100 cursor-pointer">
                              <Play className="w-8 h-8 fill-white text-white" />
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
                        <h3 className="text-2xl font-bold text-zinc-900">
                          {expertData.name}
                        </h3>
                        {expertData.isOnline && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600">
                              Online
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-md text-indigo-600 mb-3">
                        {expertData.role}
                      </p>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm text-zinc-700">
                            {expertData.experience} Experience
                          </span>
                        </div>
                      </div>

                      <StarRating
                        rating={expertData.rating}
                        reviews={expertData.reviews}
                      />

                      <p className="text-sm text-zinc-600 mt-4 pt-4 border-t border-zinc-200">
                        {expertData.bio}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-200">
                        <Button
                          variant="outline"
                          className="flex-1 rounded-xl border-slate-200 text-blue-600 bg-white text-black hover:bg-white hover:text-black"
                          onClick={() => setIsProfileModalOpen(true)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MIDDLE COLUMN - Chat UI */}
                <div className="lg:col-span-5 flex flex-col min-h-0">
                  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col  h-[33rem]">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-white">
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
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-zinc-900">
                            Chat with {expertData.name}
                          </h3>
                          <p className="text-xs text-green-600">
                            Usually responds in a few minutes
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          className="rounded-xl border-slate-200 text-blue-600 bg-white text-black hover:bg-white hover:text-black"
                          onClick={() => setIsChangeExpertOpen(true)}
                        >
                          {" "}
                          Change Expert
                        </Button>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-scroll no-scrollbar p-4 space-y-4 bg-zinc-50/50 max-h-[23rem]">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              message.sender === "user"
                                ? "bg-indigo-600 text-white rounded-br-sm"
                                : "bg-white text-zinc-900 border border-zinc-200 rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line">
                              {message.text}
                            </p>
                            <div
                              className={`flex items-center gap-1 mt-1 text-xs ${
                                message.sender === "user"
                                  ? "text-indigo-200"
                                  : "text-zinc-400"
                              }`}
                            >
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
                    <div className="p-4 border-t border-zinc-200 bg-white">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer">
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
                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 placeholder:text-zinc-400"
                          />
                        </div>
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim()}
                          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl transition-all duration-300 cursor-pointer"
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
                  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="p-5 border-b border-zinc-200">
                      <h3 className="text-xl font-bold text-zinc-900">
                        Services Menu
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">
                        Select services you want to book
                      </p>
                    </div>

                    <div
                      className={`divide-y divide-zinc-200 overflow-y-scroll scrollbar-thin ${selectedServices.length > 0 ? "max-h-[9rem]" : "max-h-[27rem]"}`}
                    >
                      {menuItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (selectedServices.includes(item.id)) {
                              setSelectedServices(
                                selectedServices.filter((id) => id !== item.id),
                              );
                            } else {
                              setSelectedServices([
                                ...selectedServices,
                                item.id,
                              ]);
                            }
                          }}
                          className={`p-4 cursor-pointer transition-all duration-200 hover:bg-zinc-50 ${
                            selectedServices.includes(item.id)
                              ? "bg-indigo-50"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Service Image */}
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0">
                              {item.imageUrl ? (
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg
                                    className="w-6 h-6 text-indigo-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Service Info */}
                            <div className="flex-1">
                              <h4 className="font-semibold text-zinc-900">
                                {item.name}
                              </h4>
                              {item.description && (
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            {/* Price & Selection */}
                            <div className="text-right">
                              <p className="text-lg font-bold text-indigo-600">
                                ${item.price}
                              </p>
                              {selectedServices.includes(item.id) && (
                                <Check className="w-5 h-5 text-indigo-600 mt-1 ml-auto" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Section */}
                  {selectedServices.length > 0 && (
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm sticky top-6">
                      <h3 className="text-xl font-bold text-zinc-900 mb-4">
                        Order Summary
                      </h3>

                      <div className="max-h-[7rem] overflow-y-scroll scrollbar-thin">
                        {/* Selected Services */}
                        <div className="space-y-2 mb-4">
                          {selectedServicesList.map((service) => (
                            <div
                              key={service.id}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-zinc-700">
                                {service.name}
                              </span>
                              <span className="font-semibold text-indigo-600">
                                ${service.price}
                              </span>
                            </div>
                          ))}
                          {selectedServicesList.length === 0 && (
                            <p className="text-center text-zinc-500 py-4 text-sm">
                              No services selected
                            </p>
                          )}
                        </div>

                        {selectedServicesList.length > 0 && (
                          <>
                            {/* Subtotal */}
                            <div className="flex justify-between items-center text-sm pt-2 border-t border-zinc-200">
                              <span className="text-zinc-600">Subtotal</span>
                              <span className="text-zinc-900">
                                ${totalAmount}
                              </span>
                            </div>

                            {/* GST */}
                            <div className="flex justify-between items-center text-sm mt-2">
                              <span className="text-zinc-600">GST (5%)</span>
                              <span className="text-zinc-900">${gst}</span>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-200">
                              <span className="text-lg font-bold text-zinc-900">
                                Total
                              </span>
                              <span className="text-2xl font-bold text-indigo-600">
                                ${totalWithGst}
                              </span>
                            </div>

                            {/* Date & Time Placeholder */}
                            <div className="mt-3 pt-3 border-t border-zinc-200">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-zinc-400" />
                                  <span className="text-zinc-600">
                                    12 April
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-zinc-400" />
                                  <span className="text-zinc-600">
                                    3:00 PM – 7:00 PM
                                  </span>
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isVideoModalOpen && expertData.videoUrl ? (
        <VideoModal
          videoUrl={expertData.videoUrl}
          onClose={() => setIsVideoModalOpen(false)}
        />
      ) : null}

      {/* Change Expert Dialog */}
      <ChangeExpertDialog
        open={isChangeExpertOpen}
        onOpenChange={setIsChangeExpertOpen}
        currentExpert={expertData}
        allExperts={normalizedAllStaff}
        onSelectExpert={(newExpert) => {
          setIsChangeExpertOpen(false);
        }}
      />

      <ProfileModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        staff={normalizedStaff}
        venueName={venueName}
      />
    </>
  );
}
