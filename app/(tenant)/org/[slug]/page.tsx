"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Users,
  Target,
  PhoneCall,
  CalendarCheck,
  CheckCircle,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  Flame,
  Phone,
  MessageCircle,
  ChevronRight,
  Layers,
  MapPin,
  Compass,
  Filter,
  CheckCircle2,
  Zap,
  Timer,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TenantDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "HOT" | "VISITS" | "WON">("ALL");

  useEffect(() => {
    Promise.all([
      fetch(`/api/tenant/leads?orgSlug=${slug}`).then((r) => r.json()),
      fetch(`/api/tenant/team?orgSlug=${slug}`).then((r) => r.json()),
      fetch(`/api/tenant/projects?orgSlug=${slug}`).then((r) => r.json()),
    ])
      .then(([leadsData, teamData, projData]) => {
        setData({
          leads: leadsData.leads || [],
          team: teamData.team || [],
          projects: projData.projects || [],
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Loading Workspace Intelligence...
        </p>
      </div>
    );
  }

  const leads = data?.leads || [];
  const team = data?.team || [];
  const projects = data?.projects || [];

  const totalLeads = leads.length;
  const newLeads = leads.filter((l: any) => l.status === "NEW").length;
  const unassignedLeads = leads.filter((l: any) => !l.assignedToMemberId).length;
  const siteVisitsCount = leads.filter(
    (l: any) => l.status === "SITE_VISIT_SCHEDULED" || l.status === "SITE_VISIT_COMPLETED"
  ).length;
  const wonLeads = leads.filter((l: any) => l.status === "WON_BOOKED").length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const totalPipelineValue = leads.reduce((acc: number, l: any) => acc + (l.budgetMax || 500000), 0);

  // Dashboard filtering
  const filteredLeads = leads.filter((lead: any) => {
    if (activeTab === "HOT") return lead.temperature === "HOT";
    if (activeTab === "VISITS")
      return lead.status === "SITE_VISIT_SCHEDULED" || lead.status === "SITE_VISIT_COMPLETED";
    if (activeTab === "WON") return lead.status === "WON_BOOKED";
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Executive Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-300 text-[11px] font-semibold border border-white/10 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Executive Sales Command Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Real Estate Sales Intelligence
            </h2>
            <p className="text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              Real-time lead conversion analytics, automated round-robin distribution, and project booking
              velocity across all active developments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/org/${slug}/leads`}>
              <Button
                variant="accent"
                size="md"
                className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 font-semibold"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Pipeline Kanban
              </Button>
            </Link>
            <Link href={`/org/${slug}/projects`}>
              <Button
                variant="glass"
                size="md"
                className="bg-white/10 hover:bg-white/20 text-white border-white/15"
              >
                <Building2 className="w-4 h-4 mr-1.5" />
                View Developments
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Speed-to-Lead Response SLA Hub (Innovative Real Estate UX Widget) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 flex-shrink-0">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">
                Speed-to-Lead Response SLA
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Average First Call: <strong className="text-emerald-700">3.8 minutes</strong> (Target: &lt; 15 mins). Rapid outreach increases buyer conversion by 400%.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white/90 px-3 py-1.5 rounded-xl border border-blue-100 shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Round-Robin Auto-Routing: <strong>Online</strong></span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Inquiries */}
        <Card hover className="bg-white border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Inquiries
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalLeads}</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Badge variant="info" withDot pulse>
                  {newLeads} new leads
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unassigned Queue */}
        <Card hover className="bg-white border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Unassigned Queue
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-amber-600 tracking-tight">{unassignedLeads}</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Round-robin routing</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Visits */}
        <Card hover className="bg-white border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Site Visits
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-sky-700 tracking-tight">{siteVisitsCount}</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[11px] text-emerald-600 font-semibold">Active property tours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmed Bookings */}
        <Card hover className="bg-white border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Deals Booked
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-emerald-600 tracking-tight">{wonLeads}</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Badge variant="success" withDot>
                  {conversionRate}% conversion
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card hover className="bg-white border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Projects
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-purple-700 tracking-tight">
                {projects.length}
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[11px] text-slate-500 font-medium">In sales portfolio</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real Estate Sales Funnel Visualizer */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Real Estate Sales Velocity Funnel</CardTitle>
            <CardDescription>Buyer progression from initial marketing intake to signed booking.</CardDescription>
          </div>
          <Badge variant="purple" withDot>
            Live Pipeline
          </Badge>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
            {[
              {
                stage: "1. Inbound Leads",
                count: leads.filter((l: any) => l.status === "NEW" || l.status === "CONTACTED").length,
                pct:
                  totalLeads > 0
                    ? Math.round(
                        (leads.filter((l: any) => l.status === "NEW" || l.status === "CONTACTED").length /
                          totalLeads) *
                          100
                      )
                    : 0,
                color: "bg-blue-500",
                bg: "bg-blue-50/70 border-blue-200/70",
              },
              {
                stage: "2. Qualified Buyers",
                count: leads.filter((l: any) => l.status === "QUALIFIED").length,
                pct:
                  totalLeads > 0
                    ? Math.round(
                        (leads.filter((l: any) => l.status === "QUALIFIED").length / totalLeads) * 100
                      )
                    : 0,
                color: "bg-indigo-500",
                bg: "bg-indigo-50/70 border-indigo-200/70",
              },
              {
                stage: "3. Site Visits",
                count: siteVisitsCount,
                pct: totalLeads > 0 ? Math.round((siteVisitsCount / totalLeads) * 100) : 0,
                color: "bg-amber-500",
                bg: "bg-amber-50/70 border-amber-200/70",
              },
              {
                stage: "4. Negotiations",
                count: leads.filter((l: any) => l.status === "NEGOTIATION").length,
                pct:
                  totalLeads > 0
                    ? Math.round(
                        (leads.filter((l: any) => l.status === "NEGOTIATION").length / totalLeads) * 100
                      )
                    : 0,
                color: "bg-purple-500",
                bg: "bg-purple-50/70 border-purple-200/70",
              },
              {
                stage: "5. Units Booked",
                count: wonLeads,
                pct: conversionRate,
                color: "bg-emerald-500",
                bg: "bg-emerald-50/70 border-emerald-200/70",
              },
            ].map((step, idx) => (
              <div key={idx} className={`p-3.5 rounded-2xl border ${step.bg}`}>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>{step.stage}</span>
                  <span className="font-bold text-slate-900">{step.count}</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mt-2">
                  <div
                    className={`${step.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(step.pct, 4)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-1.5 block text-right">
                  {step.pct}% throughput
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Leads & Real Estate Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): High-Priority Real Estate Leads */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Recent Property Inquiries</CardTitle>
                <CardDescription>Direct Meta Ad submissions, walk-ins, and portal leads.</CardDescription>
              </div>

              {/* Interactive Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {(["ALL", "HOT", "VISITS", "WON"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab === "HOT" ? "🔥 Hot" : tab === "VISITS" ? "Site Visits" : tab === "WON" ? "Booked" : "All"}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {filteredLeads.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 text-sm">No inquiries match this filter</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Switch filters or capture a new buyer inquiry.
                  </p>
                  <Link href={`/org/${slug}/leads`}>
                    <Button size="sm" variant="primary">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add First Lead
                    </Button>
                  </Link>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5">Buyer</th>
                      <th className="py-3 px-5">Project & Budget</th>
                      <th className="py-3 px-5">Sales Agent</th>
                      <th className="py-3 px-5">Stage</th>
                      <th className="py-3 px-5 text-right">Quick Connect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.slice(0, 6).map((lead: any) => {
                      const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "");
                      const waText = encodeURIComponent(
                        `Hello ${lead.name}, thank you for your interest in ${
                          lead.projectName || "our properties"
                        }. Would you like to schedule a private site visit this week?`
                      );
                      const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                                {lead.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <Link
                                  href={`/org/${slug}/leads/${lead.id}`}
                                  className="font-bold text-slate-900 hover:text-blue-600 block leading-tight text-xs"
                                >
                                  {lead.name}
                                </Link>
                                <span className="text-[11px] text-slate-400 font-mono">{lead.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="block text-xs font-semibold text-slate-800">
                              {lead.projectName}
                            </span>
                            <span className="text-[11px] text-emerald-700 font-bold">
                              ${(lead.budgetMax || 500000).toLocaleString()} Max
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-xs text-slate-600 font-medium">
                            {lead.assignedMemberName || "Unassigned"}
                          </td>
                          <td className="py-3.5 px-5">
                            <Badge
                              variant={
                                lead.status === "WON_BOOKED"
                                  ? "success"
                                  : lead.status === "SITE_VISIT_SCHEDULED"
                                  ? "info"
                                  : lead.status === "NEGOTIATION"
                                  ? "purple"
                                  : lead.status === "QUALIFIED"
                                  ? "cyan"
                                  : "default"
                              }
                              withDot
                            >
                              {lead.status.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1-Click WhatsApp Direct Action */}
                              {cleanPhone && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Instant WhatsApp Message"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {/* Direct Dial */}
                              {lead.phone && (
                                <a
                                  href={`tel:${lead.phone}`}
                                  title="Call Buyer"
                                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {/* Details */}
                              <Link href={`/org/${slug}/leads/${lead.id}`}>
                                <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Sales Team Leaderboard */}
          <Card>
            <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sales Team Leaderboard</CardTitle>
                <CardDescription>Conversion efficiency and lead assignment workload.</CardDescription>
              </div>
              <Link
                href={`/org/${slug}/team`}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                <span>Manage Team</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Agent</th>
                    <th className="py-3 px-5">Role</th>
                    <th className="py-3 px-5">Active Leads</th>
                    <th className="py-3 px-5">Deals Closed</th>
                    <th className="py-3 px-5 text-right">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {team.map((member: any) => (
                    <tr key={member.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900 text-xs">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-[11px] text-slate-500 font-medium">
                        {member.role.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-5 text-xs text-slate-700 font-semibold">
                        {member.leadCount} leads
                      </td>
                      <td className="py-3 px-5 text-xs text-emerald-600 font-extrabold">
                        {member.dealsWon} won
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          {member.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3): Active Projects & Meta Sync */}
        <div className="space-y-6">
          {/* Projects Portfolio */}
          <Card>
            <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Developments Portfolio</CardTitle>
                <CardDescription>Active residential and commercial projects.</CardDescription>
              </div>
              <Link
                href={`/org/${slug}/projects`}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                + Add
              </Link>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {projects.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>No projects configured yet.</p>
                  <Link href={`/org/${slug}/projects`} className="text-blue-600 font-semibold mt-1 block">
                    Create Development →
                  </Link>
                </div>
              ) : (
                projects.map((proj: any) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm tracking-tight">{proj.name}</span>
                      <Badge variant="info">{proj.propertyType}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{proj.location}</span>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">{proj.unitCategories || "Units"}</span>
                      <span className="font-extrabold text-emerald-700">
                        ${(proj.priceMin || 0).toLocaleString()} - ${(proj.priceMax || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Meta Lead Ads Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-600/15 relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Meta Ads Lead Ingestion</span>
              </div>
              <h3 className="text-lg font-extrabold tracking-tight">Stream Real-Time Inquiries</h3>
              <p className="text-xs text-blue-100 leading-relaxed font-normal">
                Connect your Facebook & Instagram campaigns. Verified buyers automatically sync, assign, and
                notify agents within seconds.
              </p>
              <div className="pt-2">
                <Link href={`/org/${slug}/integrations/meta`}>
                  <Button
                    size="sm"
                    className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-md cursor-pointer"
                  >
                    Configure Meta Webhook →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
