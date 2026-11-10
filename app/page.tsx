import React from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Target,
  Megaphone,
  BarChart3,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Globe2,
  Lock,
  Layers,
  Flame,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Lighting Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-extrabold text-lg text-white shadow-lg shadow-blue-500/25">
              EF
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight block">EstateFlow</span>
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest block">
                Enterprise PropTech SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Admin</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 lg:py-24 flex flex-col justify-center relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Next-Generation White-Label Real Estate CRM Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
            The Modern Operating System for Real Estate Builders
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
            Independent branded workspaces, real-time Meta Lead Ads ingestion, automated round-robin sales
            team routing, and end-to-end property unit bookings.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/admin"
              className="px-7 py-3.5 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              Platform Control Plane
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 rounded-2xl font-bold bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700/80 transition-all text-sm cursor-pointer"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto w-full">
          {[
            { label: "Closed Property Deal Volume", val: "$280M+", sub: "Cross-tenant sales" },
            { label: "Meta Ingestion Latency", val: "< 2.0s", sub: "Instant webhook sync" },
            { label: "Data Isolation Guarantee", val: "100%", sub: "Strict tenant boundaries" },
            { label: "Platform SLA Uptime", val: "99.98%", sub: "PostgreSQL & Supabase" },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center backdrop-blur-sm"
            >
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight block">
                {stat.val}
              </span>
              <span className="text-xs font-semibold text-blue-400 mt-1 block">{stat.label}</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{stat.sub}</span>
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="mt-20 pt-12 border-t border-slate-800/80">
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Commercial PropTech Architecture
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Engineered for high-volume property developers and white-label SaaS distributors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-7 rounded-3xl bg-slate-900/50 border border-slate-800/90 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg mb-2">White-Label Branding</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Every developer receives their dedicated portal, custom logo upload, brand color scheme,
                and isolated sales management environment.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-900/50 border border-slate-800/90 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg mb-2">Meta Ads Webhooks</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                HMAC-verified Facebook & Instagram Lead Ads pipeline. Automated round-robin routing guarantees
                immediate sales rep follow-up.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-900/50 border border-slate-800/90 hover:border-emerald-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg mb-2">Strict Tenant Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Database-level isolation ensures no cross-tenant leaks. Super Admins manage infrastructure,
                plans, and account status without exposing private buyer data.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 relative z-10">
        <p>EstateFlow SaaS • Multi-Tenant Real Estate CRM Platform • Built for Production</p>
      </footer>
    </div>
  );
}
