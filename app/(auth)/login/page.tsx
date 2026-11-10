"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  CheckCircle2,
  Layers,
  Flame,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push(data.redirectUrl || "/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const autofillSuperAdmin = () => {
    setEmail("kartavyagore0@gmail.com");
    setPassword("KartavyaGore@8999");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left Column: Premium Real Estate Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30">
            EF
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight block">EstateFlow</span>
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest block">
              Multi-Tenant Real Estate Platform
            </span>
          </div>
        </div>

        {/* Center Marketing Hero */}
        <div className="relative z-10 space-y-6 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-blue-300 text-xs font-bold border border-white/10">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Commercial Real Estate SaaS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
            Powering Premier Builders & Real Estate Developers
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Independent white-label workspaces, instant Meta Lead Ads webhook ingestion, automated
            round-robin distribution, and comprehensive site visit scheduling.
          </p>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl font-extrabold text-white block">$280M+</span>
              <span className="text-xs text-slate-400 mt-0.5 block">Closed Property Volume</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl font-extrabold text-blue-400 block">&lt; 2 Sec</span>
              <span className="text-xs text-slate-400 mt-0.5 block">Meta Lead Ingestion</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between border-t border-white/10 pt-6">
          <span>Enterprise Data Isolation & RBAC</span>
          <span>PostgreSQL & Supabase Secured</span>
        </div>
      </div>

      {/* Right Column: Clean, Polished Sign-In Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 bg-white">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-blue-500/20">
                EF
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">EstateFlow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Sign In to Workspace
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your authorized email credentials to access your organization portal.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl animate-in fade-in">
                {error}
              </div>
            )}

            <div>
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="email"
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/25"
              isLoading={isLoading}
            >
              Sign In to Workspace
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Quick-fill shortcut for Platform Super Admin */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Platform Super Admin</p>
                  <p className="text-[11px] text-slate-500 font-mono">kartavyagore0@gmail.com</p>
                </div>
              </div>
              <button
                type="button"
                onClick={autofillSuperAdmin}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Fill Credentials</span>
              </button>
            </div>
            <p className="text-[11px] text-center text-slate-400">
              Invited builder owners and sales team members log in using their registered organization email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
