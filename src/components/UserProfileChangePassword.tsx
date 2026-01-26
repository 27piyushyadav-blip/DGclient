/*
 * File: src/components/UserProfileChangePassword.js
 * SR-DEV: Premium Password Form
 */

"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "@/components/Icons"; // Ensure Icons.js has these or use lucide-react
import { Lock, Save, Loader2, KeyRound } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function UserProfileChangePassword() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (data) => {
    startTransition(async () => {
      toast.error("Password updates are currently unavailable.");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
       
       <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><KeyRound className="w-5 h-5 text-zinc-600 dark:text-zinc-400" /></div>
            <div>
               <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Change Password</h3>
               <p className="text-sm text-zinc-500">Ensure your account uses a strong, unique password.</p>
            </div>
          </div>

          <div className="max-w-lg space-y-6">
            <div className="space-y-2">
               <Label>Current Password</Label>
               <div className="relative">
                  <Input type={showCurrent ? "text" : "password"} {...register("currentPassword")} className="h-11 pr-10" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-zinc-400 hover:text-zinc-600">
                     {showCurrent ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
               </div>
               {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                     <Input type={showNew ? "text" : "password"} {...register("newPassword")} className="h-11 pr-10" placeholder="••••••••" />
                     <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-zinc-400 hover:text-zinc-600">
                        {showNew ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                     </button>
                  </div>
                  {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
               </div>
               
               <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" {...register("confirmPassword")} className="h-11" placeholder="••••••••" />
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
               </div>
            </div>
          </div>
       </div>

       <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            size="lg"
            disabled={isPending || !isDirty}
            className={cn("h-12 px-8 rounded-xl font-semibold shadow-lg transition-all", isDirty ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "opacity-50 cursor-not-allowed")}
          >
             {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : <><Save className="w-4 h-4 mr-2" /> Update Password</>}
          </Button>
       </div>
    </form>
  );
}