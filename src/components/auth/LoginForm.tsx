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
import { DEMO_CREDENTIALS, DemoSession } from "@/lib/demoAuth";
import { useDemoAuth } from "@/components/DemoAuthProvider";

// UI Components
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2Icon, GoogleIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";

// Validation Schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [authError, setAuthError] = useState("");

  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams?.get("callbackUrl")?.toString() || "/";
  const { setSession } = useDemoAuth();

  // Preserve original URL error handling (even though NextAuth is removed)
  useEffect(() => {
    const errorType = searchParams?.get("error");
    if (errorType === "CredentialsSignin") {
      setAuthError("Invalid email or password.");
    } else if (errorType === "OAuthAccountNotLinked") {
      setAuthError("Email already in use with a different provider.");
    } else if (errorType) {
      setAuthError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  const handleGoogleSignIn = () => {
    startGoogleTransition(() => {
      setAuthError("Authentication is currently unavailable.");
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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

    startTransition(() => {
      const isValid =
        formData.email === DEMO_CREDENTIALS.email &&
        formData.password === DEMO_CREDENTIALS.password;

      if (!isValid) {
        setAuthError("Invalid email or password.");
        return;
      }

      const session: DemoSession = {
        user: {
          id: "demo-user",
          name: "Demo User",
          email: DEMO_CREDENTIALS.email,
          image: null,
        },
      };

      setSession(session);
      router.push(callbackUrl);
      router.refresh();
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
          <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            disabled={isPending}
            className={cn(
              "h-11 transition-all focus:ring-2 focus:ring-offset-1",
              errors.email
                ? "border-red-500 focus-visible:ring-red-500"
                : "focus-visible:ring-primary"
            )}
          />
          {errors.email && (
            <p className="text-xs text-red-500 font-medium ml-1">
              {errors.email}
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
                formData.email
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

