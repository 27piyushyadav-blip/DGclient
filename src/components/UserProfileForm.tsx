/*
 * File: src/components/UserProfileForm.js
 * SR-DEV: Premium Profile Form (Final Polish)
 * FIX: Solved "Maximum update depth exceeded" by stopping event propagation on Checkbox.
 */

"use client";

import { useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import ProfileImage from "@/components/ProfileImage";
import { Loader2, Camera, Save, User, Bell, Mail, CheckCircle2 } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  profilePicture: z.string().optional(),
  marketing: z.boolean().default(false),
  security: z.boolean().default(true),
  transactional: z.boolean().default(true),
});

export default function UserProfileForm({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();
  const [previewImage, setPreviewImage] = useState(user?.profilePicture || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      profilePicture: user?.profilePicture || "",
      marketing: user?.notificationPreferences?.marketing || false,
      security: user?.notificationPreferences?.security || true,
      transactional: user?.notificationPreferences?.transactional || true,
    },
  });

  const isUploading = false;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    setValue("profilePicture", objectUrl, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    startTransition(async () => {
      toast.error("Profile updates are currently unavailable.");
    });
  };

  // Helper to toggle checkbox safely
  const toggleNotification = (id: "marketing" | "security" | "transactional") => {
    setValue(id, !watch(id), { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      {/* 1. IDENTITY CARD */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-visible">
         {/* Top Gradient Banner */}
         <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900/50 rounded-t-2xl overflow-hidden" />
         
         <div className="relative flex flex-col md:flex-row gap-8 items-start">
            
            {/* AVATAR SECTION */}
            <div className="flex-shrink-0 pt-2">
               <div className="relative group inline-block">
                  {/* Image Container */}
                  <div className="h-32 w-32 rounded-full ring-4 ring-white dark:ring-zinc-900 shadow-xl overflow-hidden bg-white dark:bg-zinc-800 relative z-10">
                     <ProfileImage 
                       src={previewImage} 
                       name={watch("name")} 
                       sizeClass="h-full w-full" 
                       textClass="text-3xl"
                     />
                     {isUploading && (
                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 backdrop-blur-sm">
                         <Loader2 className="w-8 h-8 text-white animate-spin" />
                       </div>
                     )}
                  </div>

                  {/* Camera Button */}
                  <button
                    type="button"
                    disabled={isUploading || isPending}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 z-50 p-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-white dark:border-zinc-900 flex items-center justify-center"
                    title="Change Profile Picture"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
               </div>
            </div>

            {/* Inputs */}
            <div className="flex-1 w-full space-y-6 pt-4">
               <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    {watch("name") || "Your Name"}
                    {user?.isVerified && <CheckCircle2 className="w-5 h-5 text-green-500 fill-current" />}
                  </h3>
                  <p className="text-zinc-500 text-sm">{user?.email}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label className="text-zinc-700 dark:text-zinc-300">Display Name</Label>
                     <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                        <Input {...register("name")} className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-950" placeholder="Full Name" />
                     </div>
                     {errors.name && <p className="text-xs text-red-500">{errors.name.message?.toString()}</p>}
                  </div>

                  <div className="space-y-2">
                     <Label className="text-zinc-700 dark:text-zinc-300">Email Address</Label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                        <Input value={user?.email || ""} disabled className="pl-10 h-11 bg-zinc-100 dark:bg-zinc-800 text-zinc-500" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 2. NOTIFICATIONS CARD */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
         <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-400" /></div>
            <div>
               <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Email Notifications</h3>
               <p className="text-sm text-zinc-500">Manage what emails you receive from us.</p>
            </div>
         </div>

         <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800">
             {[
               { id: "transactional" as const, label: "Session Updates", desc: "Reminders for bookings and messages.", required: true },
               { id: "security" as const, label: "Security Alerts", desc: "Login attempts and password changes.", required: true },
               { id: "marketing" as const, label: "Wellness Tips", desc: "Weekly mental health guides.", required: false }
             ].map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-start justify-between py-4 first:pt-0 last:pb-0 group cursor-pointer" 
                  onClick={() => toggleNotification(item.id)} // Row click logic
                >
                   <div>
                      <Label htmlFor={item.id} className="text-base font-medium text-zinc-900 dark:text-white cursor-pointer group-hover:text-primary transition-colors">{item.label}</Label>
                      <p className="text-sm text-zinc-500 mt-0.5">{item.desc}</p>
                   </div>
                   
                   {/* FIX: Stop Propagation to prevent double-toggle infinite loop */}
                   <div className="flex items-center h-6" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        id={item.id} 
                        checked={watch(item.id as keyof z.infer<typeof profileSchema>)} 
                        onCheckedChange={(c) => setValue(item.id as keyof z.infer<typeof profileSchema>, c, { shouldDirty: true })}
                        className="h-6 w-6 rounded-md border-zinc-300 dark:border-zinc-600 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900 data-[state=checked]:text-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:border-white dark:data-[state=checked]:text-zinc-900" 
                      />
                   </div>
                </div>
             ))}
         </div>
      </div>

      {/* 3. SAVE BAR */}
      <div className="flex justify-end pt-4">
         <Button 
            type="submit" 
            size="lg"
            disabled={isPending || !isDirty} 
            className={cn("h-12 px-8 rounded-xl font-semibold shadow-lg transition-all", isDirty ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 hover:scale-[1.02]" : "opacity-50 cursor-not-allowed")}
         >
            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
         </Button>
      </div>

    </form>
  );
}