/*
 * File: src/components/auth/LoginForm.tsx
 * Client Component for Login (Demo-only, no backend).
 */

"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// UI Components
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2Icon, GoogleIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";

// Validation Schema
const loginSchema = z.object({
  identifier: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [authError, setAuthError] = useState("");

  const { login } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams?.get("callbackUrl")?.toString() || "/";
  const message = searchParams?.get("message");

  // Show success message from registration
  useEffect(() => {
    if (message) {
      toast.success(message);
    }
  }, [message]);

  const handleGoogleSignIn = () => {
    startGoogleTransition(() => {
      window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/auth/expert'}/google`;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setAuthError("");

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        await login(formData.identifier, formData.password);
        toast.success("Login successful!");
        router.push(callbackUrl);
        router.refresh();
      } catch (error: any) {
        const errorMessage = error.message || "Login failed. Please try again.";
        setAuthError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <div className="grid gap-6">
      <Button
        variant="outline"
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending || isGooglePending}
        className="w-full gap-2 h-11 text-base font-medium border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
      >
        {isGooglePending ? (
          <Loader2Icon className="h-5 w-5 animate-spin" />
        ) : (
          <GoogleIcon className="h-5 w-5" />
        )}
        Sign in with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-zinc-950 px-3 text-zinc-500 font-medium">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
        {authError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg font-medium text-center dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 animate-in fade-in zoom-in duration-300">
            {authError}
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="identifier" className="text-zinc-700 dark:text-zinc-300">
            Email Address
          </Label>
          <Input
            id="identifier"
            type="email"
            placeholder="name@example.com"
            value={formData.identifier}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, identifier: e.target.value }))
            }
            disabled={isPending}
            className={cn(
              "h-11 transition-all focus:ring-2 focus:ring-offset-1",
              errors.identifier
                ? "border-red-500 focus-visible:ring-red-500"
                : "focus-visible:ring-primary"
            )}
          />
          {errors.identifier && (
            <p className="text-xs text-red-500 font-medium ml-1">
              {errors.identifier}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-zinc-700 dark:text-zinc-300"
            >
              Password
            </Label>
            <Link
              href={`/forgot-password?email=${encodeURIComponent(
                formData.identifier
              )}`}
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              disabled={isPending}
              className={cn(
                "h-11 pr-10 transition-all focus:ring-2 focus:ring-offset-1",
                errors.password
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "focus-visible:ring-primary"
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-11 w-11 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </Button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 font-medium ml-1">
              {errors.password}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all mt-2"
          disabled={isPending || isGooglePending}
        >
          {isPending ? (
            <>
              <Loader2Icon className="mr-2 h-5 w-5 animate-spin" /> Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </div>
  );
}

