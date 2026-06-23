"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DarkModeToggle from "@/components/DarkModeToggle";
import ProfileImage from "@/components/ProfileImage";
import {
  User,
  LogOut,
  Calendar,
  Settings,
  Menu,
  X,
  LifeBuoy,
  MessageCircle,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MobileHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      setGreeting("Good Morning 👋");
    } else if (hour < 17) {
      setGreeting("Good Afternoon 👋");
    } else if (hour < 20) {
      setGreeting("Good Evening 👋");
    } else {
      setGreeting("We're Available 24/7 🌙");
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full  bg-[linear-gradient(180deg,#f8fbff_0%,#f6f8fc_100%)]",
        isScrolled && "shadow-sm",
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="items-center text-xl text-zinc-900 dark:text-white"
          >
            {/* <div className="p-1.5 bg-zinc-900 dark:bg-white rounded-lg">
              <span className="text-white dark:text-zinc-900 text-sm font-extrabold">
                MN
              </span>
            </div> */}
            <div className="mx-auto max-w-[1600px] items-center lg:hidden">
          {/* <p className="text-xs text-blue-700">{greeting || " "}</p> */}
          <div className="w-20" />
        </div>
            <span className="text-2xl font-bold tracking-wider">VELVETBOOK</span>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">

          {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                    <ProfileImage
                      src={user.image || undefined}
                      name={user.name || ""}
                      sizeClass="h-9 w-9"
                      textClass="text-xs"
                      className=""
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="cursor-pointer w-full flex items-center py-2.5"
                    >
                      <User className="mr-3 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/appointments"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Calendar className="h-4 w-4" />
                      My Appointments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/main"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Calendar className="h-4 w-4" />
                      Main
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/chat"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Messages
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/support"
                      className="cursor-pointer w-full flex items-center py-2.5"
                    >
                      <LifeBuoy className="mr-3 h-4 w-4" /> Help & Support
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/feedback"
                      className="cursor-pointer w-full flex items-center py-2.5"
                    >
                      <MessageCircle className="mr-3 h-4 w-4" /> Give Feedback
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            
            {/* <DarkModeToggle className={undefined} /> */}
           <div className="relative">
            <div className="absolute top-0.5 right-1.5 h-1 w-1 rounded-full bg-red-800"></div>
            <Bell className="h-[1.7rem] w-[1.7rem] bg-white shadow-lg p-1 rounded-xs" />
            </div>

            

            {/* Mobile Menu Button */}

            <div className="relative" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? (
                <X className="h-[1.7rem] w-[1.7rem]" />
              ) : (
                <Menu className="h-[1.7rem] w-[1.7rem] bg-white shadow-2xs p-0.5 rounded-xs" />
              )}
            </div>
            {/* <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-[2rem] w-[2rem]" />
              ) : (
                <Menu className="h-[2rem] w-[2rem] bg-white shadow-2xs p-0.5 rounded-xs" />
              )}
            </Button> */}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 py-4 space-y-2">
            <Link
              href="/"
              className={cn(
                "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive("/")
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/experts"
              className={cn(
                "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive("/experts")
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Experts
            </Link>
            <Link
              href="/organizations"
              className={cn(
                "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive("/organizations")
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Organizations
            </Link>
            <Link
              href="/appointments"
              className={cn(
                "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive("/appointments")
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Appointments
            </Link>
            <Link
              href="/main"
              className={cn(
                "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive("/main")
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Main
            </Link>
            {isAuthenticated && (
              <Link
                href="/chat"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive("/chat")
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageCircle className="h-4 w-4" />
                Messages
              </Link>
            )}
            {!isAuthenticated && (
              <>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </Button>
                  <Button className="w-full mt-2" asChild>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </Button>
                </div>
              </>
            )}
            {isAuthenticated && user && (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-sm font-medium rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  href="/appointments"
                  className="block px-3 py-2 text-sm font-medium rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Appointments
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
