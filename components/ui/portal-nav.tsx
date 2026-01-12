"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Settings,
  User,
  Briefcase,
  ShieldCheck,
  BarChart3,
  Activity,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Home,
  Search,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalNavProps {
  role: "admin" | "employer" | "jobseeker";
  userName?: string;
  notifications?: number;
}

export default function PortalNav({ role, userName, notifications = 0 }: PortalNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileOpen && !(event.target as Element).closest(".profile-dropdown")) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isProfileOpen]);

  const getNavItems = () => {
    const baseItems = [
      { href: `/${role}/dashboard`, label: "Dashboard", icon: Home },
      { href: "/settings", label: "Settings", icon: Settings },
    ];

    switch (role) {
      case "admin":
        return [
          ...baseItems,
          { href: "/admin/reports", label: "Reports", icon: ShieldCheck },
          { href: "/admin/employers/verifications", label: "Verifications", icon: ShieldCheck },
          { href: "/admin/audit-logs", label: "Audit Logs", icon: Activity },
        ];
      case "employer":
        return [
          ...baseItems,
          { href: "/employer/jobs", label: "My Jobs", icon: Briefcase },
          { href: "/employer/applications", label: "Applications", icon: User },
          { href: "/employer/analytics", label: "Analytics", icon: BarChart3 },
          { href: "/employer/verification", label: "Verification", icon: ShieldCheck },
        ];
      case "jobseeker":
        return [
          ...baseItems,
          { href: "/jobs", label: "Browse Jobs", icon: Search },
          { href: "/jobseeker/applications", label: "My Applications", icon: Briefcase },
          { href: "/jobseeker/alerts", label: "Job Alerts", icon: Bell },
          { href: "/jobseeker/second-me", label: "AI Assistant", icon: User },
          { href: "/profile", label: "Profile", icon: User },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const handleSignOut = async () => {
    try {
      await fetch("/auth/signout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-white font-black text-sm">CM</span>
            </div>
            <span className="font-black text-xl text-slate-950">Careers.mt</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.slice(0, -1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "text-brand bg-brand/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Notifications for jobseekers */}
            {role === "jobseeker" && (
              <Link
                href="/jobseeker/alerts"
                className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Bell className="h-5 w-5 text-slate-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">
                    {notifications > 99 ? "99+" : notifications}
                  </span>
                )}
              </Link>
            )}

            {/* Quick Actions */}
            {role === "employer" && (
              <Link
                href="/employer/jobs/new"
                className="flex items-center gap-2 bg-brand px-4 py-2 rounded-lg text-white text-sm font-medium hover:bg-brand/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Post Job
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="profile-dropdown relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <ChevronDown className="h-4 w-4 text-slate-600" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{userName || "User"}</p>
                    <p className="text-xs text-slate-500 capitalize">{role}</p>
                  </div>

                  {(() => {
                    const lastItem = navItems[navItems.length - 1];
                    return (
                      <Link
                        href={lastItem.href}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <lastItem.icon className="h-4 w-4" />
                        {lastItem.label}
                      </Link>
                    );
                  })()}

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-slate-600" />
              ) : (
                <Menu className="h-5 w-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "text-brand bg-brand/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
