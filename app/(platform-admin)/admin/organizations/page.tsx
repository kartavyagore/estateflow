"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Archive,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchOrgs = () => {
    setIsLoading(true);
    fetch("/api/admin/organizations")
      .then((res) => res.json())
      .then((d) => {
        setOrgs(d.organizations || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleStatusChange = async (orgId: string, newStatus: string) => {
    setActionLoadingId(orgId);
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrgs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = orgs.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.slug.toLowerCase().includes(search.toLowerCase()) ||
      (o.businessEmail && o.businessEmail.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Real Estate Organizations
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage multi-tenant developers, control account status, and enforce subscription quotas.
          </p>
        </div>
        <Link href="/admin/organizations/new">
          <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Create New Organization
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search by company name, slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {["ALL", "ACTIVE", "SUSPENDED", "ARCHIVED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === s
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Loading Organizations...
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Company</th>
                  <th className="py-3.5 px-6">Slug & Domain</th>
                  <th className="py-3.5 px-6">Subscription</th>
                  <th className="py-3.5 px-6">Employees</th>
                  <th className="py-3.5 px-6">Total Inquiries</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-500">
                      <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-800 text-sm">No organizations found</p>
                      <p className="text-xs text-slate-400 mt-1 mb-4">
                        {search || statusFilter !== "ALL"
                          ? "Try clearing your search or status filter"
                          : "Onboard your first real estate builder to activate their white-label workspace."}
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
                  filtered.map((org) => {
                    const isBusy = actionLoadingId === org.id;
                    return (
                      <tr key={org.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-xs"
                              style={{ backgroundColor: org.branding?.primaryColor || "#2563EB" }}
                            >
                              {org.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="block font-bold text-slate-900 text-xs">{org.name}</span>
                              <span className="block text-[11px] text-slate-400 font-normal">
                                {org.businessEmail || "No email"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-600">/org/{org.slug}</td>
                        <td className="py-4 px-6">
                          <Badge variant="purple">{org.planName || "Starter"}</Badge>
                        </td>
                        <td className="py-4 px-6 text-slate-600 text-xs font-medium">
                          {org.employeeCount} active
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 text-xs">{org.leadCount}</td>
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
                          <div className="flex items-center justify-end gap-2">
                            {org.status === "ACTIVE" ? (
                              <button
                                disabled={isBusy}
                                onClick={() => handleStatusChange(org.id, "SUSPENDED")}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-colors cursor-pointer disabled:opacity-50"
                                title="Suspend organization access"
                              >
                                {isBusy ? "Updating..." : "Suspend"}
                              </button>
                            ) : (
                              <button
                                disabled={isBusy}
                                onClick={() => handleStatusChange(org.id, "ACTIVE")}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer disabled:opacity-50"
                                title="Reactivate organization"
                              >
                                {isBusy ? "Updating..." : "Activate"}
                              </button>
                            )}

                            {org.status !== "ARCHIVED" && (
                              <button
                                disabled={isBusy}
                                onClick={() => handleStatusChange(org.id, "ARCHIVED")}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors cursor-pointer disabled:opacity-50"
                                title="Archive organization"
                              >
                                {isBusy ? "Updating..." : "Archive"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
