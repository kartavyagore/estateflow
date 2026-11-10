"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Server,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/organizations")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Connecting to SaaS Infrastructure...
        </p>
      </div>
    );
  }

  const orgs = data?.organizations || [];
  const activeOrgs = orgs.filter((o: any) => o.status === "ACTIVE").length;
  const suspendedOrgs = orgs.filter((o: any) => o.status === "SUSPENDED").length;
  const totalLeads = orgs.reduce((sum: number, o: any) => sum + (o.leadCount || 0), 0);
  const totalEmployees = orgs.reduce((sum: number, o: any) => sum + (o.employeeCount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Platform Infrastructure Overview
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Global multi-tenant control plane, subscription quotas, and developer lifecycle governance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/organizations/new">
            <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Onboard Organization
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hover className="bg-white border-slate-200/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Builders
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{orgs.length}</span>
              <div className="flex items-center gap-2 mt-1.5 text-xs">
                <span className="text-emerald-600 font-bold">{activeOrgs} active</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-600 font-bold">{suspendedOrgs} suspended</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="bg-white border-slate-200/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Platform Leads Ingested
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalLeads}</span>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">Cross-tenant lead throughput</p>
            </div>
          </CardContent>
        </Card>

        <Card hover className="bg-white border-slate-200/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Sales Agents
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalEmployees}</span>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">Assigned builder representatives</p>
            </div>
          </CardContent>
        </Card>

        <Card hover className="bg-white border-slate-200/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Infrastructure Health
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">100% Online</span>
              <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Meta Webhooks & APIs Healthy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Table Card */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="py-5 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Onboarded Real Estate Developers</CardTitle>
            <CardDescription>Each developer operates in an isolated white-label workspace.</CardDescription>
          </div>
          <Link href="/admin/organizations">
            <Button variant="outline" size="sm" className="font-semibold text-xs">
              Manage All Developers →
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Developer Organization</th>
                <th className="py-3.5 px-6">Assigned Path</th>
                <th className="py-3.5 px-6">Subscription Tier</th>
                <th className="py-3.5 px-6">Team Size</th>
                <th className="py-3.5 px-6">Total Inquiries</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-800 text-sm">No organizations onboarded yet</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">
                      Onboard your first real estate builder to activate their white-label workspace.
                    </p>
                    <Link href="/admin/organizations/new">
                      <Button variant="primary" size="sm">
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Onboard First Organization
                      </Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                orgs.map((org: any) => (
                  <tr key={org.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-xs"
                          style={{ backgroundColor: org.branding?.primaryColor || "#2563EB" }}
                        >
                          {org.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block text-slate-900 font-bold text-xs">{org.name}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {org.businessType || "Developer"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">/org/{org.slug}</td>
                    <td className="py-4 px-6">
                      <Badge variant="purple">{org.planName || "Starter"}</Badge>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-xs font-medium">
                      {org.employeeCount} Members
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-bold text-xs">{org.leadCount}</td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          org.status === "ACTIVE"
                            ? "success"
                            : org.status === "SUSPENDED"
                            ? "danger"
                            : "default"
                        }
                        withDot
                      >
                        {org.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href="/admin/organizations"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        Manage Status →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
