"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Phone,
  Mail,
  Building,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Flame,
  DollarSign,
  Tag,
  Building2,
  Sparkles,
  PhoneCall,
  MessageCircle,
  Timer,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

const STAGES = [
  { id: "NEW", label: "New Leads", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "CONTACTED", label: "Contacted", color: "bg-sky-50 text-sky-700 border-sky-200" },
  { id: "QUALIFIED", label: "Qualified", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "SITE_VISIT_SCHEDULED", label: "Site Visit Scheduled", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "SITE_VISIT_COMPLETED", label: "Site Visit Done", color: "bg-teal-50 text-teal-700 border-teal-200" },
  { id: "NEGOTIATION", label: "In Negotiation", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "WON_BOOKED", label: "Booked / Won", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "LOST", label: "Lost", color: "bg-slate-100 text-slate-600 border-slate-200" },
];

export default function TenantLeadsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [leads, setLeads] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    email: "",
    source: "MANUAL",
    projectId: "",
    propertyType: "APARTMENT",
    budgetMin: "400000",
    budgetMax: "750000",
    timeline: "1_3_MONTHS",
    priority: "HIGH",
    temperature: "HOT",
    requirements: "",
  });

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      fetch(`/api/tenant/leads?orgSlug=${slug}`).then((r) => r.json()),
      fetch(`/api/tenant/projects?orgSlug=${slug}`).then((r) => r.json()),
      fetch(`/api/tenant/team?orgSlug=${slug}`).then((r) => r.json()),
    ])
      .then(([leadsRes, projRes, teamRes]) => {
        setLeads(leadsRes.leads || []);
        setProjects(projRes.projects || []);
        setTeam(teamRes.team || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  const handleStageMove = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/tenant/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug: slug, status: newStatus }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tenant/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug: slug, ...newLead }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewLead({
          name: "",
          phone: "",
          email: "",
          source: "MANUAL",
          projectId: "",
          propertyType: "APARTMENT",
          budgetMin: "400000",
          budgetMax: "750000",
          timeline: "1_3_MONTHS",
          priority: "HIGH",
          temperature: "HOT",
          requirements: "",
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLeads = leads.filter((l: any) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      (l.email && l.email.toLowerCase().includes(search.toLowerCase()));

    const matchesSource = sourceFilter === "ALL" || l.source === sourceFilter;
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    const matchesProject = projectFilter === "ALL" || l.projectId === projectFilter;

    return matchesSearch && matchesSource && matchesStatus && matchesProject;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Leads & Deal Pipeline
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time pipeline flow, automated agent assignment, and stage velocity tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Switcher */}
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            className="bg-[var(--primary,#2563EB)] text-white shadow-sm hover:shadow-md font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Capture New Lead
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search by buyer name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Project Filter */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200/90 bg-white text-slate-700 outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200/90 bg-white text-slate-700 outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="ALL">All Sources</option>
              <option value="META_ADS">Meta Lead Ads</option>
              <option value="MANUAL">Manual Entry</option>
              <option value="WEBSITE">Website</option>
              <option value="PORTAL">Real Estate Portal</option>
              <option value="WALK_IN">Walk-In Inquiry</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200/90 bg-white text-slate-700 outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="ALL">All Stages</option>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Kanban or Table */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Loading Pipeline...
          </p>
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN BOARD */
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
          {STAGES.map((stage, stageIdx) => {
            const stageLeads = filteredLeads.filter((l: any) => l.status === stage.id);
            return (
              <div
                key={stage.id}
                className="w-80 flex-shrink-0 flex flex-col bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3 max-h-[78vh]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs tracking-tight">
                      {stage.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                {/* Stage Cards Scroll */}
                <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-300/80 rounded-xl">
                      Empty stage
                    </div>
                  ) : (
                    stageLeads.map((lead: any) => {
                      const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "");
                      const waText = encodeURIComponent(
                        `Hi ${lead.name}, I am following up on your inquiry for ${
                          lead.projectName || "our properties"
                        }. When would be a good time to speak?`
                      );
                      const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

                      return (
                        <div
                          key={lead.id}
                          className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-2.5 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/org/${slug}/leads/${lead.id}`}
                              className="font-bold text-slate-900 text-xs hover:text-blue-600 block leading-snug"
                            >
                              {lead.name}
                            </Link>
                            {lead.temperature === "HOT" ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                                HOT
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-400">
                                {lead.temperature || "WARM"}
                              </span>
                            )}
                          </div>

                          {/* Response SLA Indicator for New Leads */}
                          {lead.status === "NEW" && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                              <Timer className="w-3 h-3 text-blue-600" />
                              <span>SLA: 15m Response Target</span>
                            </div>
                          )}

                          {/* Project & Budget */}
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span className="font-semibold truncate max-w-[140px]">
                              {lead.projectName || "General"}
                            </span>
                            <span className="font-extrabold text-emerald-700">
                              ${(lead.budgetMax || 500000).toLocaleString()}
                            </span>
                          </div>

                          {/* Contact & 1-Click WhatsApp Quick Action */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                            <span className="font-mono">{lead.phone}</span>
                            <div className="flex items-center gap-1">
                              {cleanPhone && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="1-Click WhatsApp Message"
                                  className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                              )}
                              {lead.phone && (
                                <a
                                  href={`tel:${lead.phone}`}
                                  title="Call Buyer"
                                  className="p-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Assignee & Stage Shifter Toolbar */}
                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <span className="text-slate-500 font-medium truncate max-w-[120px]">
                              {lead.assignedMemberName || "Unassigned"}
                            </span>
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              {stageIdx > 0 && (
                                <button
                                  title={`Move to ${STAGES[stageIdx - 1].label}`}
                                  onClick={() => handleStageMove(lead.id, STAGES[stageIdx - 1].id)}
                                  className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                              )}
                              {stageIdx < STAGES.length - 1 && (
                                <button
                                  title={`Move to ${STAGES[stageIdx + 1].label}`}
                                  onClick={() => handleStageMove(lead.id, STAGES[stageIdx + 1].id)}
                                  className="p-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer font-bold"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Buyer Name</th>
                  <th className="py-3.5 px-6">Project Inquiry</th>
                  <th className="py-3.5 px-6">Budget Max</th>
                  <th className="py-3.5 px-6">Assigned Agent</th>
                  <th className="py-3.5 px-6">Source</th>
                  <th className="py-3.5 px-6">Stage</th>
                  <th className="py-3.5 px-6 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead: any) => {
                  const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "");
                  const waText = encodeURIComponent(
                    `Hi ${lead.name}, I am following up on your inquiry for ${
                      lead.projectName || "our properties"
                    }. When would be a good time to speak?`
                  );
                  const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          href={`/org/${slug}/leads/${lead.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 block text-xs"
                        >
                          {lead.name}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-mono">{lead.phone}</span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-700 font-semibold">
                        {lead.projectName}
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-emerald-700">
                        ${(lead.budgetMax || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                        {lead.assignedMemberName || "Unassigned"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {lead.source}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={
                            lead.status === "WON_BOOKED"
                              ? "success"
                              : lead.status === "SITE_VISIT_SCHEDULED"
                              ? "info"
                              : lead.status === "NEGOTIATION"
                              ? "purple"
                              : "default"
                          }
                          withDot
                        >
                          {lead.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {cleanPhone && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Instant WhatsApp"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              title="Direct Phone Call"
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <Link href={`/org/${slug}/leads/${lead.id}`}>
                            <Button size="xs" variant="outline">
                              View Deal →
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Capture Lead Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Capture New Property Lead"
        description="Lead is automatically routed through the round-robin distribution engine."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Buyer Full Name"
              required
              placeholder="e.g. Rahul Sharma"
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            />
            <Input
              label="Phone Number"
              required
              placeholder="+91-9876543210"
              value={newLead.phone}
              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="buyer@domain.com"
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Project
              </label>
              <select
                value={newLead.projectId}
                onChange={(e) => setNewLead({ ...newLead, projectId: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200/90 bg-white text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">General Development Inquiry</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Min Budget ($)"
              type="number"
              value={newLead.budgetMin}
              onChange={(e) => setNewLead({ ...newLead, budgetMin: e.target.value })}
            />
            <Input
              label="Max Budget ($)"
              type="number"
              value={newLead.budgetMax}
              onChange={(e) => setNewLead({ ...newLead, budgetMax: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Urgency Temperature
              </label>
              <select
                value={newLead.temperature}
                onChange={(e) => setNewLead({ ...newLead, temperature: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200/90 bg-white text-slate-800 outline-none"
              >
                <option value="HOT">🔥 HOT (Ready Buyer)</option>
                <option value="WARM">⚡ WARM (1-3 Months)</option>
                <option value="COLD">❄️ COLD (Exploring)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Add & Auto-Assign Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
