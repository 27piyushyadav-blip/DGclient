/*
 * File: src/components/auth/OtpForm.tsx
 * Client Component for OTP Verification (demo-only).
 */

"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DEMO_CREDENTIALS, DemoSession } from "@/lib/demoAuth";
import { useDemoAuth } from "@/components/DemoAuthProvider";

// UI Components
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2Icon } from "@/components/Icons";

export default function OtpForm() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  // Resend Logic
  const [cooldown, setCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<"" | "success" | "error">("");
  const [resendMessage, setResendMessage] = useState("");

  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email")?.toString() || null;
  const { setSession } = useDemoAuth();

  // --- Timer Logic ---
  useEffect(() => {
    let timer: number | undefined;
    if (cooldown > 0) {
      timer = window.setInterval(
        () => setCooldown((prev) => prev - 1),
        1000
      );
    }
    return () => {
      if (timer !== undefined) {
        window.clearInterval(timer);
      }
    };
  }, [cooldown]);

  // --- Security Redirect ---
  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a complete 6-digit code.");
      return;
    }

    startTransition(() => {
      const session: DemoSession = {
        user: {
          id: "demo-user",
          name: "Demo User",
          email: email || DEMO_CREDENTIALS.email,
          image: null,
        },
      };
      setSession(session);
      router.push("/");
      router.refresh();
    });
  };

  const handleResend = () => {
    if (cooldown > 0 || isResending) return;

    startResendTransition(() => {
      setResendMessage("");
      setResendStatus("");
      setResendStatus("success");
      setResendMessage("New code sent!");
      setCooldown(60);
    });
  };

  if (!email) return null;

  return (
    <div className="grid gap-6 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          We&apos;ve sent a 6-digit verification code to <br />
          <span className="font-medium text-zinc-900 dark:text-white">
            {email}
          </span>
        </p>
        <button
          onClick={() => router.push("/register")}
          className="text-xs text-primary hover:underline font-medium"
        >
          Change email address
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        {error && (
          <div className="w-full p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg font-medium text-center dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
            {error}
          </div>
        )}

        {/* OTP Input Group */}
        <div className="flex justify-center w-full">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            disabled={isPending}
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot
                index={0}
                className="rounded-md border-zinc-300 dark:border-zinc-700"
              />
              <InputOTPSlot
                index={1}
                className="rounded-md border-zinc-300 dark:border-zinc-700"
              />
              <InputOTPSlot
                index={2}
                className="rounded-md border-zinc-300 dark:border-zinc-700"
              />
              <InputOTPSlot
                index={3}
                className="rounded-md border-zinc-300 dark:border-zinc-700"
              />
              <InputOTPSlot
                index={4}
                className="rounded-md border-zinc-300 dark:border-zinc-700"
              />
              <InputOTPSlot
                index={5}
                className="rounded-md border-zinc-300 dark:border-zinc-700"
              />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold shadow-md"
          disabled={isPending || otp.length !== 6}
        >
          {isPending ? (
            <>
              <Loader2Icon className="mr-2 h-5 w-5 animate-spin" /> Verifying...
            </>
          ) : (
            "Verify & Login"
          )}
        </Button>
      </form>

      {/* Resend Section */}
      <div className="text-center space-y-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Didn&apos;t receive the code?
        </p>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          type="button"
          className={cn(
            "text-primary font-semibold hover:bg-primary/10 min-w-[140px]",
            cooldown > 0 && "opacity-50 cursor-not-allowed text-zinc-500"
          )}
        >
          {isResending ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            "Resend Code"
          )}
        </Button>

        {resendMessage && (
          <p
            className={cn(
              "text-xs font-medium animate-in slide-in-from-top-1",
              resendStatus === "success" ? "text-green-600" : "text-red-500"
            )}
          >
            {resendMessage}
          </p>
        )}
      </div>
    </div>
  );
}

