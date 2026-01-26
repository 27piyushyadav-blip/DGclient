/*
 * File: src/components/UserProfileTabs.js
 * SR-DEV: Premium Settings Layout
 * DESIGN: Vertical Sidebar for Desktop, Horizontal Pills for Mobile.
 */

"use client";

import UserProfileForm from "@/components/UserProfileForm";
import UserProfileChangePassword from "@/components/UserProfileChangePassword";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserProfileTabs({ user }) {
  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your account preferences and security.</p>
      </div>

      <Tabs defaultValue="general" className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* --- NAVIGATION SIDEBAR --- */}
        <aside className="lg:w-64 flex-shrink-0">
           <TabsList className="flex flex-row lg:flex-col h-auto bg-transparent p-0 gap-2 w-full overflow-x-auto no-scrollbar justify-start">
              
              <TabsTrigger 
                value="general" 
                className="w-full justify-start px-4 py-3 rounded-xl font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-zinc-200 dark:data-[state=active]:border-zinc-800 transition-all text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                 <User className="w-4 h-4 mr-3" /> 
                 <span className="flex-1 text-left">My Profile</span>
              </TabsTrigger>

              <TabsTrigger 
                value="security" 
                className="w-full justify-start px-4 py-3 rounded-xl font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-zinc-200 dark:data-[state=active]:border-zinc-800 transition-all text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                 <ShieldCheck className="w-4 h-4 mr-3" />
                 <span className="flex-1 text-left">Password & Security</span>
              </TabsTrigger>

           </TabsList>

           {/* Sidebar Promo */}
           <div className="hidden lg:block mt-10 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800 border border-indigo-100 dark:border-zinc-700/50">
              <div className="h-8 w-8 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center shadow-sm text-indigo-500 mb-3">
                 <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">Pro Tip</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                 Updating your profile picture increases trust and helps experts recognize you during video calls.
              </p>
           </div>
        </aside>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 min-w-0">
            <TabsContent value="general" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
               <UserProfileForm user={user} />
            </TabsContent>
            
            <TabsContent value="security" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
               <UserProfileChangePassword />
            </TabsContent>
        </div>

      </Tabs>
    </div>
  );
}