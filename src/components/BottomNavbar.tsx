"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, MessageCircle, User, Heart, BadgeHelp, ShoppingBag, LayoutGridIcon } from "lucide-react";

const BottomNavbar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
      href: "/main",
      icon: Home,
    },
    {
      name: "Menu",
      href: "/mobile/menu",
      icon: LayoutGridIcon,
    },
    {
      name: "Service",
      href: "/service",
      icon: ShoppingBag, // Replace with actual icon
    },
    {
      name: "Experts",
      href: "/experts",
      icon: User,
    },
    {
      name: "Help",
      href: "/order",
      icon: BadgeHelp,
    },
  ];

  return (
    <>
      
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg xl:hidden">
        <div className="flex items-center justify-around h-11 md:h-20 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                }`}
              >
                <Icon
                  className={`w-4 h-4 md:w-6 md:h-6 ${
                    isActive ? "stroke-2" : "stroke-[1.5]"
                  }`}
                />
                <span className="text-[10px] md:text-sm font-medium">
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute -top-[1px] w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNavbar;