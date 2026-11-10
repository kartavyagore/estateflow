"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Webhook,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  useEffect(() => {
    // Check for tenant access restricted alert
    if (searchParams.get("error") === "tenant_access_restricted") {
      setShowPrivacyNotice(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Load current authenticated admin
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((d) => {
        if (d.user) setCurrentUser(d.user);
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Organizations", href: "/admin/organizations", icon: Building2 },
    { label: "Plans & Limits", href: "/admin/plans", icon: CreditCard },
    { label: "Webhook Logs", href: "/admin/webhooks", icon: Webhook },
    { label: "Security & Audit", href: "/admin/audit-logs", icon: ShieldAlert },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const adminName = currentUser?.name || "Platform Administrator";
  const adminEmail = currentUser?.email || "admin@estateflow.io";
  const initials =
    adminName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SA";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
            EF
          </div>
          <span className="font-semibold text-sm tracking-wide">EstateFlow Platform Admin</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 rounded-md text-slate-400 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col border-r border-slate-800`}
      >
        <div className="p-6 border-b border-slate-800 hidden md:flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              EF
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block">EstateFlow</span>
              <span className="text-[11px] font-medium text-blue-400 tracking-wider uppercase block">
                Platform Admin
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="truncate">
              <span className="block text-xs font-semibold text-white truncate">{adminName}</span>
              <span className="block text-[11px] text-slate-400 truncate">{adminEmail}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Platform Control Plane</h1>
            <p className="text-xs text-slate-500">Global SaaS Multi-Tenant Infrastructure</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </header>

        {/* Dismissible Privacy Guard Notification */}
        {showPrivacyNotice && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Tenant Privacy Protected:</strong> Platform Super Admins manage the platform
                (subscriptions, status, logs) and cannot directly access or view tenant CRM portals to
                ensure complete business privacy.
              </span>
            </div>
            <button
              onClick={() => setShowPrivacyNotice(false)}
              className="text-amber-700 hover:text-amber-900 font-bold ml-4 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
