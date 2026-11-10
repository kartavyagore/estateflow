"use client";

import React, { useEffect, useState, use } from "react";
import {
  BarChart3,
  Download,
  TrendingUp,
  Target,
  Award,
  Layers,
  CheckCircle2,
  Calendar,
  Sparkles,
  PieChart,
  Megaphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TenantReportsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/tenant/leads?orgSlug=${slug}`).then((r) => r.json()),
      fetch(`/api/tenant/team?orgSlug=${slug}`).then((r) => r.json()),
    ])
      .then(([leadsData, teamData]) => {
        setData({
          leads: leadsData.leads || [],
          team: teamData.team || [],
        });
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [slug]);

  const leads = data?.leads || [];
  const team = data?.team || [];

  const total = leads.length;
  const contacted = leads.filter((l: any) => l.status !== "NEW").length;
  const qualified = leads.filter(
    (l: any) =>
      l.status === "QUALIFIED" ||
      l.status === "SITE_VISIT_SCHEDULED" ||
      l.status === "SITE_VISIT_COMPLETED" ||
      l.status === "NEGOTIATION" ||
      l.status === "WON_BOOKED"
  ).length;
  const siteVisits = leads.filter(
    (l: any) =>
      l.status === "SITE_VISIT_SCHEDULED" ||
      l.status === "SITE_VISIT_COMPLETED" ||
      l.status === "NEGOTIATION" ||
      l.status === "WON_BOOKED"
  ).length;
  const negotiations = leads.filter(
    (l: any) => l.status === "NEGOTIATION" || l.status === "WON_BOOKED"
  ).length;
  const won = leads.filter((l: any) => l.status === "WON_BOOKED").length;

  const funnelSteps = [
    { label: "1. Inquiries Ingested", count: total, pct: 100, color: "bg-blue-600" },
    {
      label: "2. First Contact Made",
      count: contacted,
      pct: total ? Math.round((contacted / total) * 100) : 0,
      color: "bg-sky-600",
    },
    {
      label: "3. Qualified Buyers",
      count: qualified,
      pct: total ? Math.round((qualified / total) * 100) : 0,
      color: "bg-indigo-600",
    },
    {
      label: "4. Property Site Visits",
      count: siteVisits,
      pct: total ? Math.round((siteVisits / total) * 100) : 0,
      color: "bg-teal-600",
    },
    {
      label: "5. Active Negotiations",
      count: negotiations,
      pct: total ? Math.round((negotiations / total) * 100) : 0,
      color: "bg-purple-600",
    },
    {
      label: "6. Closed Bookings",
      count: won,
      pct: total ? Math.round((won / total) * 100) : 0,
      color: "bg-emerald-600",
    },
  ];

  const sourcesMap: Record<string, number> = {};
  leads.forEach((l: any) => {
    sourcesMap[l.source] = (sourcesMap[l.source] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Sales Performance & Marketing ROI
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Stage conversion bottlenecks, marketing channel velocity, and sales quota attainment.
          </p>
        </div>
        <a href={`/api/tenant/reports/export?orgSlug=${slug}`} download>
          <Button variant="outline" className="bg-white border-slate-200/90 shadow-xs font-semibold">
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV Audit Report
          </Button>
        </a>
      </div>

      {/* Conversion Funnel Card */}
      <Card hover className="bg-white border-slate-200/80">
        <CardHeader className="py-5 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle>End-to-End Buyer Conversion Funnel</CardTitle>
            <CardDescription>
              Conversion efficiency across each sequential sales milestone.
            </CardDescription>
          </div>
          <Badge variant="purple" withDot>
            Full Journey Audit
          </Badge>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {funnelSteps.map((step, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>{step.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900">{step.count} Buyers</span>
                  <span className="text-slate-400 font-mono w-12 text-right">{step.pct}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`${step.color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(step.pct, 3)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Two Column: Marketing Sources & Agent Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marketing Attribution */}
        <Card hover className="bg-white border-slate-200/80">
          <CardHeader className="py-5 px-6">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-600" />
              <CardTitle>Lead Acquisition by Source</CardTitle>
            </div>
            <CardDescription>Attribution distribution across paid ad channels and walk-ins.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {Object.keys(sourcesMap).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No source data yet.</p>
            ) : (
              Object.entries(sourcesMap).map(([source, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={source} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{source.replace(/_/g, " ")}</span>
                      <span>
                        {count} inquiries ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Agent Conversion Comparison */}
        <Card hover className="bg-white border-slate-200/80">
          <CardHeader className="py-5 px-6">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <CardTitle>Sales Agent Deal Velocity</CardTitle>
            </div>
            <CardDescription>Individual agent conversion percentages and unit bookings.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {team.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No team members assigned.</p>
            ) : (
              team.map((member: any) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{member.name}</span>
                      <span className="text-[11px] text-slate-400">{member.leadCount} inquiries</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-600 block">
                      {member.dealsWon} Deals Closed
                    </span>
                    <span className="text-[10px] font-bold text-purple-700">
                      {member.conversionRate}% Conversion
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
