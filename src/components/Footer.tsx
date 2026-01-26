/*
 * File: src/components/Footer.js
 * SR-DEV: Premium Footer
 * ACTION: Integrated Newsletter Signup Logic (File 106) and cleaned up links (File 113).
 */

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { MindNamoLogo } from "@/components/Icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Twitter, Instagram, Linkedin, Facebook, Mail, MapPin } from "lucide-react";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    startTransition(async () => {
      toast.error("Subscription is currently unavailable.");
    });
  };

  return (
    <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
      <Input 
        placeholder="Enter your email" 
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isPending}
        className="bg-zinc-900 border-zinc-800 text-white h-11 focus-visible:ring-zinc-700 placeholder:text-zinc-600" 
      />
      <Button 
        size="lg" 
        className="h-11 px-8 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold"
        disabled={isPending}
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
      </Button>
    </form>
  );
}

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-white border-t border-zinc-900">
      <div className="container mx-auto max-w-6xl px-4 md:px-8 pt-16 pb-10">
        
        {/* --- Top Section: Brand & Newsletter --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 border-b border-zinc-900 pb-12">
          
          {/* Brand */}
          <div className="space-y-6">
             <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-white">
                <div className="p-2 bg-white rounded-lg">
                   <MindNamoLogo className="h-6 w-6 text-zinc-950" />
                </div>
                Mind Namo
             </Link>
             <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
               Your safe space for mental wellness. Connecting you with certified experts for secure, private, and personalized therapy sessions.
             </p>
             <div className="flex gap-3">
                <SocialLink href="#" icon={Twitter} label="Twitter" />
                <SocialLink href="#" icon={Instagram} label="Instagram" />
                <SocialLink href="#" icon={Linkedin} label="LinkedIn" />
                <SocialLink href="#" icon={Facebook} label="Facebook" />
             </div>
          </div>

          {/* Newsletter */}
          <div className="lg:pl-12">
             <h4 className="text-base font-bold text-white mb-3">Join our Newsletter</h4>
             <p className="text-zinc-400 text-sm mb-5">
               Get weekly wellness tips and platform updates directly to your inbox.
             </p>
             <NewsletterForm />
          </div>
        </div>

        {/* --- Middle Section: Navigation Links --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
           
           {/* Column 1: Platform */}
           <div className="space-y-4">
              <h4 className="font-bold text-white">Platform</h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/experts" className="hover:text-white transition-colors">Experts</Link></li>
                <li><Link href="/organizations" className="hover:text-white transition-colors">Organizations</Link></li>
                {/* Removed: About Us (404 link) */}
              </ul>
           </div>

           {/* Column 2: Support */}
           <div className="space-y-4">
              <h4 className="font-bold text-white">Support</h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li><Link href="/support" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
           </div>

           {/* Column 3 & 4: Contact Info (Spans 2 cols on Desktop) */}
           <div className="col-span-2 md:col-span-2 space-y-4">
              <h4 className="font-bold text-white">Contact Us</h4>
              <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
                 
                 {/* Email Block */}
                 <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-zinc-300 text-sm font-medium mb-1">
                       <Mail className="w-4 h-4 text-zinc-500" /> Email
                    </div>
                    <a href="mailto:support@mindnamo.com" className="text-sm text-white hover:text-blue-400 transition-colors break-all">
                       support@mindnamo.com
                    </a>
                 </div>

                 {/* Address Block */}
                 <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-zinc-300 text-sm font-medium mb-1">
                       <MapPin className="w-4 h-4 text-zinc-500" /> Address
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                       123 Wellness Blvd, Tech Park,<br />Bangalore, India 560001
                    </p>
                 </div>

              </div>
           </div>

        </div>

        {/* --- Bottom: Copyright --- */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
           <p>&copy; {new Date().getFullYear()} Mind Namo Inc. All rights reserved.</p>
           <div className="flex gap-6">
              <span>Made with ❤️ for Mental Health</span>
           </div>
        </div>

      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon, label }) {
  return (
    <Link 
      href={href} 
      aria-label={label} 
      className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:bg-white hover:text-zinc-950 transition-all duration-300 border border-zinc-800 hover:border-white"
    >
       <Icon className="w-4 h-4" />
    </Link>
  );
}