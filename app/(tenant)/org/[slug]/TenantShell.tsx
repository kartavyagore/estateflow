"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users2,
  Building,
  Target,
  Megaphone,
  BarChart3,
  Palette,
  LogOut,
  Menu,
  X,
  Plus,
  Search,
  Sparkles,
  Zap,
  CheckCircle2,
  Building2,
  Layers,
  ArrowRight,
  PhoneCall,
  CalendarCheck,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export default function TenantShell({
  children,
  slug,
}: {
  children: React.ReactNode;
  slug: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [orgData, setOrgData] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");

  useEffect(() => {
    // Fetch organization branding & info
    fetch(`/api/tenant/branding?orgSlug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.branding || data.orgName) {
          setOrgData(data);
        }
      })
      .catch(console.error);

    // Fetch current user session
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(console.error);

    // Global Command Palette Shortcut (⌘K or Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slug]);

  const branding = orgData?.branding;
  const primaryColor = branding?.primaryColor || "#2563EB";
  const secondaryColor = branding?.secondaryColor || "#1E40AF";
  const accentColor = branding?.accentColor || "#EA580C";
  const businessName =
    orgData?.orgName || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const navItems = [
    { label: "Executive CRM", href: `/org/${slug}`, icon: LayoutDashboard },
    { label: "Leads & Pipeline", href: `/org/${slug}/leads`, icon: Target },
    { label: "Developments & Units", href: `/org/${slug}/projects`, icon: Building },
    { label: "Sales Team", href: `/org/${slug}/team`, icon: Users2 },
    { label: "Meta Lead Ads", href: `/org/${slug}/integrations/meta`, icon: Megaphone },
    { label: "Analytics & ROI", href: `/org/${slug}/reports`, icon: BarChart3 },
    { label: "White-Label Brand", href: `/org/${slug}/settings/branding`, icon: Palette },
  ];

  const quickActions = [
    { label: "Capture New Lead", href: `/org/${slug}/leads`, icon: Plus },
    { label: "Add New Development", href: `/org/${slug}/projects`, icon: Building2 },
    { label: "Invite Sales Agent", href: `/org/${slug}/team`, icon: Users2 },
    { label: "Configure Meta Ads", href: `/org/${slug}/integrations/meta`, icon: Megaphone },
    { label: "Customize Branding", href: `/org/${slug}/settings/branding`, icon: Palette },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const userRole = currentUser?.activeRole || "OWNER";
  const formattedRole = userRole.replace(/_/g, " ");

  const filteredNav = navItems.filter((i) =>
    i.label.toLowerCase().includes(paletteQuery.toLowerCase())
  );
  const filteredActions = quickActions.filter((a) =>
    a.label.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  return (
    <div
      className="min-h-screen bg-slate-50/70 flex flex-col md:flex-row text-slate-800"
      style={
        {
          "--primary": primaryColor,
          "--secondary": secondaryColor,
          "--accent": accentColor,
        } as React.CSSProperties
      }
    >
      {/* Mobile Top Header */}
      <div
        className="md:hidden text-white p-4 flex items-center justify-between shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-2.5">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={businessName}
              className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shadow-xs"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-sm">
              {businessName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="font-bold text-sm truncate tracking-tight">{businessName}</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 rounded-lg text-white/90 hover:text-white hover:bg-white/10"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Dynamic White-Label Navigation Sidebar */}
      <aside
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-white border-r border-slate-200/80 flex-shrink-0 flex flex-col shadow-[1px_0_10px_rgba(15,23,42,0.02)]`}
      >
        {/* Dynamic Tenant Branding Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {branding?.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={businessName}
                className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200/90 p-1 shadow-xs flex-shrink-0"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {businessName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <span className="font-bold text-slate-900 text-sm tracking-tight block truncate">
                {businessName}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase block">
                Enterprise CRM
              </span>
            </div>
          </div>
        </div>

        {/* Quick Lead Launch Button */}
        <div className="px-4 pt-4 pb-2">
          <Link href={`/org/${slug}/leads`}>
            <button
              className="w-full py-2.5 px-3 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-4 h-4" />
              <span>Capture New Lead</span>
            </button>
          </Link>
        </div>

        {/* Tenant Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
                style={isActive ? { backgroundColor: primaryColor } : {}}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Meta Ingestion Status Pill */}
        <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-600">Meta Webhooks</span>
          </div>
          <span className="font-semibold text-emerald-600">Live & Synced</span>
        </div>

        {/* User Session Info Badge */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ backgroundColor: secondaryColor }}
            >
              {(currentUser?.name || "U").slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-bold text-slate-900 truncate">
                {currentUser?.name || "Workspace Member"}
              </span>
              <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {formattedRole}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Tenant View Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">{businessName}</h1>
              <p className="text-[11px] text-slate-500 font-medium">
                {branding?.welcomeMessage || "White-Labeled Real Estate Lead Workspace"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Interactive Search Bar Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/80 text-xs text-slate-500 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Quick Navigation & Actions...</span>
              <kbd className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 ml-2 shadow-xs">
                ⌘K
              </kbd>
            </button>

            <Link href={`/org/${slug}/leads`}>
              <Button size="sm" variant="primary" className="bg-[var(--primary,#2563EB)] text-white shadow-xs font-bold">
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>New Lead</span>
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>

      {/* Interactive Command Palette Modal (⌘K) */}
      <Modal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        title="Quick Navigator & Actions"
        description="Press ⌘K or Ctrl+K anywhere to jump across modules."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              placeholder="Type a module or action..."
              value={paletteQuery}
              onChange={(e) => setPaletteQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                Workspace Modules
              </span>
              <div className="space-y-1">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        setIsCommandPaletteOpen(false);
                        router.push(item.href);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredActions.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                  Quick Actions
                </span>
                <div className="space-y-1">
                  {filteredActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => {
                          setIsCommandPaletteOpen(false);
                          router.push(action.href);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50/50 hover:bg-blue-100/70 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-blue-600" />
                          <span>{action.label}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
