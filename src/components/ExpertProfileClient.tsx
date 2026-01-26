/*
 * File: src/components/ExpertProfileClient.js
 * SR-DEV: World-Class Expert Profile (Final Optimized Version)
 * ACTION: Fixed 'Objects are not valid as React child' crash by handling array fields properly.
 */

"use client";

import { useState, useEffect, useRef, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Star, MapPin, GraduationCap, Languages, CheckCircle2, 
  Video, Clock, ShieldCheck, Play, MessageSquare, CalendarCheck, 
  Share2, MoreHorizontal, AlertCircle, Loader2, Building2, HelpCircle, Flag, Users, FileBadge, Award,
  User, Briefcase
} from "lucide-react";
import { FileTextIcon } from "@/components/Icons";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils"; 
import BookingModal from "@/components/BookingModal"; 
import ProfileImage from "@/components/ProfileImage";

import VideoModal from "@/components/modals/VideoModal";
import ReportModal from "@/components/modals/ReportModal";
import ExpertDocumentCard from "@/components/ExpertDocumentCard";
import DocumentViewerModal from "@/components/modals/DocumentViewerModal";

// --- SUB-COMPONENTS ---

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
  <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 shadow-sm transition-all duration-500 hover:shadow-lg hover:border-zinc-200 dark:hover:border-zinc-700 h-full justify-center">
    <div className="p-2.5 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-400 mb-2"><Icon className="w-5 h-5" strokeWidth={1.5} /></div>
    <p className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{value}</p>
    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">{label}</p>
  </div>
);

const SectionCard = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" /> {title}
        </h3>
        {children}
    </section>
);


// --- MAIN COMPONENT ---

export default function ExpertProfileClient({ expert }: { expert: any }) { 
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<any>(null); 
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  const [isChatPending, startChatTransition] = useTransition();
  const [isCopied, setIsCopied] = useState(false);
  
  const [isProfileHeaderVisible, setIsProfileHeaderVisible] = useState(true);
  const profileHeaderRef = useRef(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Price Calculation
  const startingPrice = useMemo(() => {
    if (!expert.services?.length) return 0;
    return expert.services.reduce((min: number, s: any) => Math.min(min, Math.min(s.videoPrice ?? Infinity, s.clinicPrice ?? Infinity)), Infinity);
  }, [expert.services]);
  const displayPrice = startingPrice === Infinity ? "N/A" : `₹${startingPrice}`;

  // Check if URL has a video param to auto-open it
  useEffect(() => {
    if (expert.videoUrl && searchParams?.get("video") === "true") {
      setShowVideoModal(true);
    }
  }, [expert.videoUrl, searchParams]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsProfileHeaderVisible(entry.isIntersecting), { threshold: 0.1, rootMargin: "-50px 0px 0px 0px" });
    if (profileHeaderRef.current) observer.observe(profileHeaderRef.current);
    return () => {
      if (profileHeaderRef.current) observer.unobserve(profileHeaderRef.current);
    };
  }, []);

  const handleChatClick = () => {
    startChatTransition(async () => {
      router.push("/chat");
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: `Consult ${expert.name}`, text: `Check out ${expert.name} on Mind Namo`, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); } catch {}
    }
  };

  const getRelativeTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)); 
    if (diffDays <= 1) return "Today";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={cn("w-3.5 h-3.5", i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-700")} />
    ));
  };


  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-32 relative font-sans">
      
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-yellow-100/40 dark:bg-yellow-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/40 dark:bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* --- HERO SECTION --- */}
      <div ref={profileHeaderRef} className="relative z-10 pt-8 pb-12 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
         <div className="container max-w-6xl mx-auto px-4 md:px-6">
            
            <nav className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-8">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link> <span className="text-zinc-300">/</span>
              <Link href="/experts" className="hover:text-primary transition-colors">Experts</Link> <span className="text-zinc-300">/</span>
              <span className="text-primary font-medium truncate max-w-[200px]">{expert.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row gap-8 items-start text-left">
               {/* Avatar */}
               <div className="relative group flex-shrink-0 cursor-pointer" onClick={() => setViewingDocument({type: 'image', url: expert.profilePicture, title: expert.name})}>
                  <div className="relative p-1 bg-white dark:bg-zinc-950 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm">
                     <ProfileImage src={expert.profilePicture} name={expert.name} sizeClass="w-32 h-32 md:w-40 md:h-40" className="rounded-full" priority />
                  </div>
                  {expert.isOnline && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-2 py-1 rounded-full shadow-md border border-zinc-100 dark:border-zinc-800 z-20">
                       <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                       <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">Online</span>
                    </div>
                  )}
               </div>

               {/* Info */}
               <div className="flex-1">
                  <div className="flex flex-col md:flex-row items-start md:items-end gap-3 mb-4">
                     <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">{expert.name}</h1>
                     {expert.isVerified && (
                        <div className="flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/50 mb-2">
                           <CheckCircle2 className="w-3.5 h-3.5 fill-current" /> <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
                        </div>
                     )}
                  </div>
                  <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl leading-relaxed">
                    <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{expert.specialization}</span> with {expert.experienceYears}+ years of experience.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                     <Badge variant="outline" className="font-normal text-zinc-600 dark:text-zinc-400 gap-1.5 py-1 px-3 bg-zinc-50 dark:bg-zinc-800"><MapPin className="w-3.5 h-3.5" /> {expert.location}</Badge>
                     <Badge variant="outline" className="font-normal text-zinc-600 dark:text-zinc-400 gap-1.5 py-1 px-3 bg-zinc-50 dark:bg-zinc-800"><Languages className="w-3.5 h-3.5" /> {expert.languages?.join(", ")}</Badge>
                     <Badge variant="outline" className="font-normal text-zinc-600 dark:text-zinc-400 gap-1.5 py-1 px-3 bg-zinc-50 dark:bg-zinc-800"><GraduationCap className="w-3.5 h-3.5" /> {expert.latestEducation || expert.education?.[0]?.degree || "N/A"}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                     {expert.videoUrl && (
                        <Button className="rounded-full gap-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold px-5 shadow-lg transition-all hover:scale-[1.01] duration-500" onClick={() => setShowVideoModal(true)}>
                           <Play className="w-4 h-4 fill-current" /> Watch Intro
                        </Button>
                     )}
                     <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handleShare}>{isCopied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />} Share</Button>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="w-5 h-5" /></Button></DropdownMenuTrigger>
                       <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setIsReportModalOpen(true)} className="text-red-600 cursor-pointer"><Flag className="w-4 h-4 mr-2" /> Report Profile</DropdownMenuItem></DropdownMenuContent>
                     </DropdownMenu>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-20 mt-8">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Details */}
            <div className="lg:col-span-2 space-y-8">
               
               {/* Quick Stats */}
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard icon={Star} label="Rating" value={expert.rating?.toFixed(1)} />
                  <StatCard icon={Clock} label="Experience" value={`${expert.experienceYears}+ Yrs`} />
                  <StatCard icon={Video} label="Sessions" value={expert.reviewCount * 5 + "+"} />
                  <StatCard icon={ShieldCheck} label="Verified" value="100%" />
               </div>

               <Tabs defaultValue="about" className="w-full">
                  <TabsList className="w-full justify-start h-auto p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg mb-6">
                     <TabsTrigger value="about" className="flex-1 py-2.5 rounded-md font-medium">About</TabsTrigger>
                     <TabsTrigger value="reviews" className="flex-1 py-2.5 rounded-md font-medium">Reviews ({expert.reviewCount})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="space-y-8 animate-in fade-in duration-300">
                     {/* Bio */}
                     <SectionCard title="About Me" icon={User}>
                        {/* FIXED: Added break-words and overflow handling for long words */}
                        <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base whitespace-pre-line break-words overflow-hidden">
                          {expert.bio || "No bio available."}
                        </div>
                     </SectionCard>

                     {/* Work Experience */}
                     {expert.workHistory?.length > 0 && (
                        <SectionCard title="Work Experience" icon={Briefcase}>
                           <div className="space-y-6">
                              {expert.workHistory.map((job, i) => (
                                 <div key={i} className="flex gap-4">
                                    <div className="mt-1 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg h-fit border border-zinc-100 dark:border-zinc-700">
                                       <Building2 className="w-5 h-5 text-zinc-500" />
                                    </div>
                                    <div>
                                       <h4 className="font-bold text-zinc-900 dark:text-white text-base">{job.role}</h4>
                                       <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{job.company}</p>
                                       <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                           {job.location && <span>{job.location} • </span>}
                                           {new Date(job.startDate).getFullYear()} - {job.current ? 'Present' : new Date(job.endDate).getFullYear()}
                                       </p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </SectionCard>
                     )}

                     {/* Education */}
                     {expert.education?.length > 0 && (
                        <SectionCard title="Education" icon={GraduationCap}>
                           <div className="space-y-4">
                              {expert.education.map((edu, i) => (
                                 <div key={i} className="flex gap-4 items-start">
                                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 flex-shrink-0" />
                                    <div>
                                       <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{edu.degree} in {edu.fieldOfStudy}</h4>
                                       <p className="text-sm text-zinc-600 dark:text-zinc-400">{edu.institution}</p>
                                       <p className="text-xs text-zinc-400 mt-0.5">
                                         {new Date(edu.startDate).getFullYear()} - {edu.current ? 'Present' : new Date(edu.endDate).getFullYear()}
                                       </p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </SectionCard>
                     )}
                     
                     {/* Documents/Credentials Section */}
                     {expert.documents?.length > 0 && (
                        <SectionCard title="Documents & Credentials" icon={FileTextIcon}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {expert.documents.map((doc, i) => (
                                 <ExpertDocumentCard 
                                    key={i} 
                                    document={doc} 
                                    onDocumentClick={setViewingDocument}
                                 />
                               ))}
                            </div>
                        </SectionCard>
                     )}

                     {/* Rich Profile Data */}
                     {(expert.awards?.length > 0 || expert.memberships?.length > 0 || expert.registrations?.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {expert.awards?.length > 0 && (
                              <SectionCard title="Awards" icon={Award}>
                                 <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
                                    {expert.awards.map((a, i) => (
                                       <li key={i} className="text-sm"><span className="font-medium text-zinc-900 dark:text-white">{a.title}</span> <span className="text-xs text-zinc-400">({a.year})</span></li>
                                    ))}
                                 </ul>
                              </SectionCard>
                           )}
                           {expert.memberships?.length > 0 && (
                              <SectionCard title="Memberships" icon={Users}>
                                 <ul className="list-disc list-outside ml-4 space-y-2 text-zinc-700 dark:text-zinc-300">
                                    {expert.memberships.map((m, i) => <li key={i} className="text-sm">{m}</li>)}
                                 </ul>
                              </SectionCard>
                           )}
                           {expert.registrations?.length > 0 && (
                              <SectionCard title="Registrations" icon={FileBadge}>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {expert.registrations.map((reg, i) => (
                                       <div key={i} className="text-sm">
                                          <p className="font-medium text-zinc-900 dark:text-zinc-200">{reg.registrationNumber}</p>
                                          <p className="text-zinc-500 text-xs">{reg.council} - {reg.year}</p>
                                       </div>
                                    ))}
                                 </div>
                              </SectionCard>
                           )}
                        </div>
                     )}

                     {/* Clinics */}
                     {expert.clinics?.length > 0 && (
                        <SectionCard title="Clinic Locations" icon={Building2}>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {expert.clinics.map((clinic, i) => (
                                 <div key={i} className="group border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-all">
                                    <div className="h-32 bg-zinc-100 relative">
                                       <img src={clinic.images?.[0] || "/placeholder-clinic.jpg"} alt={clinic.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4">
                                       <h4 className="font-bold text-zinc-900 dark:text-white">{clinic.name}</h4>
                                       <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{clinic.address}</p>
                                       <div className="flex items-center gap-2 mt-3 text-xs font-medium text-zinc-600 dark:text-zinc-400"><Clock className="w-3.5 h-3.5" /> {clinic.timings}</div>
                                       <Button variant="outline" size="sm" className="w-full mt-4 h-8 text-xs">Get Directions</Button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </SectionCard>
                     )}

                     {/* FAQs */}
                     {expert.faqs?.length > 0 && (
                        <SectionCard title="Common Questions" icon={HelpCircle}>
                           <div className="space-y-4">
                              {expert.faqs.map((faq, i) => (
                                <div key={i} className="border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                                   <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">{faq.question}</p>
                                   <p className="text-sm text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
                                </div>
                              ))}
                           </div>
                        </SectionCard>
                     )}
                  </TabsContent>

                  <TabsContent value="reviews" className="animate-in fade-in duration-300">
                     <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6">
                        {expert.reviews?.length > 0 ? expert.reviews.map((review, i) => (
                           <div key={i} className="pb-6 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                              <div className="flex justify-between items-center mb-2">
                                 <div className="flex items-center gap-3">
                                    <ProfileImage name={review.reviewerName} sizeClass="w-10 h-10" />
                                    <div><span className="font-semibold text-sm block text-zinc-900 dark:text-white">{review.reviewerName}</span><div className="flex gap-0.5 mt-0.5">{renderStars(review.rating)}</div></div>
                                 </div>
                                 <span className="text-xs text-zinc-400">{getRelativeTime(review.date)}</span>
                              </div>
                              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-[52px]">"{review.comment}"</p>
                           </div>
                        )) : (
                          <div className="text-center py-12 text-zinc-500">No reviews yet.</div>
                        )}
                     </div>
                  </TabsContent>
               </Tabs>
            </div>

            {/* RIGHT COLUMN: STICKY BOOKING CARD */}
            <div className="hidden lg:block lg:col-span-1 relative">
               <div className="sticky top-24 space-y-4">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 transition-all duration-500">
                     {!isProfileHeaderVisible && (
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4">
                           <ProfileImage src={expert.profilePicture} name={expert.name} sizeClass="w-12 h-12" className="rounded-full shadow-sm" />
                           <div><h3 className="font-bold text-base leading-tight text-zinc-900 dark:text-white">{expert.name}</h3><p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{expert.specialization}</p></div>
                        </div>
                     )}
                     <div className="flex items-center justify-between mb-2"><p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Session Price</p></div>
                     <div className="flex items-baseline gap-1 mb-6"><span className="text-3xl font-black text-zinc-900 dark:text-white">{displayPrice}</span></div>
                     <div className="space-y-3">
                        <Button size="lg" className="w-full h-12 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 shadow-md group transition-all hover:scale-[1.01] duration-500" onClick={() => setIsBookingModalOpen(true)}>Book Appointment <CalendarCheck className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" /></Button>
                        <Button variant="outline" size="lg" className="w-full h-12 rounded-xl" onClick={handleChatClick} disabled={isChatPending}>{isChatPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Message Expert"}</Button>
                     </div>
                     <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800"><div className="flex items-center justify-center gap-2 text-xs font-medium text-zinc-500"><ShieldCheck className="w-4 h-4 text-green-500" /> 100% Confidential & Secure</div></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* FIXED: Improved responsive mobile sticky bar with better alignment and spacing */}
     {/* FIXED: Improved responsive mobile sticky bar with better spacing and safe area support */}
     <div className="lg:hidden fixed bottom-0 left-0 right-0 px-5 pt-4 pb-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 z-50 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.08)] safe-area-bottom">
         <div className="flex flex-col gap-0.5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Starts at</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">{displayPrice}</p>
         </div>
         <div className="flex gap-3">
            <Button 
               variant="outline" 
               size="icon" 
               className="h-12 w-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 shadow-sm" 
               onClick={handleChatClick} 
               disabled={isChatPending}
            >
               {isChatPending ? <Loader2 className="w-5 h-5 animate-spin text-zinc-600" /> : <MessageSquare className="w-5 h-5" />}
            </Button>
            <Button 
               size="lg" 
               className="h-12 px-8 rounded-xl font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-lg active:scale-95 transition-transform" 
               onClick={() => setIsBookingModalOpen(true)}
            >
               Book Now
            </Button>
         </div>
      </div>

      {viewingDocument && <DocumentViewerModal document={viewingDocument} onClose={() => setViewingDocument(null)} />}
      {showVideoModal && <VideoModal videoUrl={expert.videoUrl} onClose={() => setShowVideoModal(false)} />}
      
      {isBookingModalOpen && (
        <BookingModal expert={expert} onClose={() => setIsBookingModalOpen(false)} />
      )}
      
      {isReportModalOpen && (
        <ReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)} 
          expertName={expert.name} 
          expertId={expert._id}
        />
      )}
    </div>
  );
}