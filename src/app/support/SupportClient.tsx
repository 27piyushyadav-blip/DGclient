/*
 * File: src/app/support/SupportClient.js
 * SR-DEV: Interactive Support Center
 * Features:
 * - Live Search with filtering.
 * - Contact Option Cards.
 * - Expandable FAQ Accordion.
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronDown, Mail, MessageCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock FAQ Data
const FAQS = [
  {
    category: "Account",
    q: "How do I reset my password?",
    a: "Go to the Login page and click 'Forgot Password'. We will send you a secure link to reset it."
  },
  {
    category: "Appointments",
    q: "Can I cancel a session?",
    a: "Yes, you can cancel up to 24 hours before the scheduled time for a full refund. Go to 'My Appointments' to manage your bookings."
  },
  {
    category: "Appointments",
    q: "How do I join the video call?",
    a: "A 'Join Call' button will appear on your appointment card 10 minutes before the session starts."
  },
  {
    category: "Privacy",
    q: "Is my therapy confidential?",
    a: "Absolutely. We use end-to-end encryption for video calls and do not record your sessions. Your data is strictly private."
  },
  {
    category: "Payments",
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, debit cards, and UPI payments via our secure payment gateway."
  },
];

export default function SupportClient() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Filter FAQs based on search input
  const filteredFaqs = useMemo(() => {
    if (!search) return FAQS;
    const lowerSearch = search.toLowerCase();
    return FAQS.filter(
      (f) =>
        f.q.toLowerCase().includes(lowerSearch) ||
        f.a.toLowerCase().includes(lowerSearch)
    );
  }, [search]);

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* --- Hero Search Section --- */}
      <div className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
           <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
             How can we help you?
           </h1>
           <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" />
              <Input 
                placeholder="Search for answers..." 
                className="pl-12 h-14 rounded-full text-lg shadow-sm border-zinc-300 dark:border-zinc-700 focus-visible:ring-primary bg-zinc-50 dark:bg-zinc-950"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* --- Contact Cards --- */}
      <div className="max-w-5xl w-full px-4 -mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative z-10">
         <Card className="bg-white dark:bg-zinc-900 shadow-lg border-zinc-100 dark:border-zinc-800 hover:-translate-y-1 transition-transform">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
               <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">Email Support</h3>
                  <p className="text-sm text-zinc-500 mt-1">Get a response within 24 hours.</p>
               </div>
               <Link href="mailto:support@mindnamo.com" className="w-full">
                 <Button variant="outline" className="w-full">Send Email</Button>
               </Link>
            </CardContent>
         </Card>

         <Card className="bg-white dark:bg-zinc-900 shadow-lg border-zinc-100 dark:border-zinc-800 hover:-translate-y-1 transition-transform">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
               <div className="h-12 w-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">Live Chat</h3>
                  <p className="text-sm text-zinc-500 mt-1">Available Mon-Fri, 9am - 6pm.</p>
               </div>
               <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">Start Chat</Button>
            </CardContent>
         </Card>

         <Card className="bg-white dark:bg-zinc-900 shadow-lg border-zinc-100 dark:border-zinc-800 hover:-translate-y-1 transition-transform">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
               <div className="h-12 w-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">Documentation</h3>
                  <p className="text-sm text-zinc-500 mt-1">Read our guides and policies.</p>
               </div>
               <Link href="/terms" className="w-full">
                  <Button variant="ghost" className="w-full border border-dashed border-zinc-300 dark:border-zinc-700">View Docs</Button>
               </Link>
            </CardContent>
         </Card>
      </div>

      {/* --- FAQ Section --- */}
      <div className="max-w-3xl w-full px-4 pb-24">
        <h2 className="text-2xl font-bold mb-8 text-center text-zinc-900 dark:text-white">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, i) => (
              <div 
                key={i} 
                className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm"
              >
                <button 
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{faq.q}</span>
                  <ChevronDown className={cn("w-5 h-5 text-zinc-400 transition-transform duration-200", openIndex === i && "rotate-180")} />
                </button>
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    openIndex === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                   <p className="p-5 pt-0 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                     {faq.a}
                   </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
               <p>No results found for "{search}".</p>
               <p className="text-sm mt-1">Try a different keyword or contact us directly.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}