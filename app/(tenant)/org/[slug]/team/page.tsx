"use client";

import React, { useEffect, useState, use } from "react";
import {
  Users2,
  Plus,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Target,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export default function TenantTeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [team, setTeam] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "SALESPERSON",
    capacity: "50",
    password: "Password123!",
  });

  const fetchTeam = () => {
    setIsLoading(true);
    fetch(`/api/tenant/team?orgSlug=${slug}`)
      .then((res) => res.json())
      .then((d) => {
        setTeam(d.team || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTeam();
  }, [slug]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tenant/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug: slug, ...form }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setForm({
          name: "",
          email: "",
          phone: "",
          role: "SALESPERSON",
          capacity: "50",
          password: "Password123!",
        });
        fetchTeam();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAssignedLeads = team.reduce((sum, m) => sum + (m.leadCount || 0), 0);
  const totalDealsWon = team.reduce((sum, m) => sum + (m.dealsWon || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Sales Team & Round-Robin Routing
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor sales rep capacities, conversion velocity, and lead assignment quotas.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="bg-[var(--primary,#2563EB)] text-white font-bold shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Team Member
        </Button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover className="bg-white border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Team Members
              </span>
              <span className="text-2xl font-extrabold text-slate-900">{team.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card hover className="bg-white border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Inquiries Handled
              </span>
              <span className="text-2xl font-extrabold text-blue-600">{totalAssignedLeads}</span>
            </div>
          </CardContent>
        </Card>

        <Card hover className="bg-white border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Deals Closed
              </span>
              <span className="text-2xl font-extrabold text-emerald-600">{totalDealsWon}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Member Cards Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Loading Team Members...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((member: any) => {
            const capacity = member.capacity || 50;
            const activeLeads = member.leadCount || 0;
            const loadPct = Math.min(Math.round((activeLeads / capacity) * 100), 100);

            return (
              <Card key={member.id} hover className="bg-white border-slate-200/80">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{member.name}</h3>
                        <Badge
                          variant={
                            member.role === "OWNER"
                              ? "purple"
                              : member.role === "SALES_MANAGER"
                              ? "info"
                              : "default"
                          }
                          className="mt-1"
                        >
                          {member.role.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="success" withDot pulse>
                      Online
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>Lead Capacity</span>
                      <span className="text-slate-900 font-bold">
                        {activeLeads} / {capacity}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          loadPct > 80 ? "bg-amber-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${Math.max(loadPct, 4)}%` }}
                      />
                    </div>
                  </div>

                  {/* Deals Won & Conversion */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Deals Won
                      </span>
                      <span className="text-sm font-extrabold text-emerald-600">
                        {member.dealsWon}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Conversion
                      </span>
                      <span className="text-sm font-extrabold text-purple-600">
                        {member.conversionRate}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Sales Team Member"
        description="Invited sales agents receive login credentials and start receiving auto-distributed leads."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Priya Patel"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Company Email"
            type="email"
            required
            placeholder="agent@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="+91-9876543210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Organizational Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200/90 bg-white text-slate-800 outline-none"
              >
                <option value="SALESPERSON">Sales Representative</option>
                <option value="SALES_MANAGER">Sales Manager</option>
                <option value="OWNER">Organization Owner</option>
              </select>
            </div>
            <Input
              label="Lead Active Capacity"
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            />
          </div>

          <Input
            label="Temporary Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <div className="pt-2 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Invite Team Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
