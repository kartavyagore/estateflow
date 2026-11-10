"use client";

import React, { useEffect, useState, use } from "react";
import {
  Building,
  Plus,
  MapPin,
  Tag,
  DollarSign,
  Home,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Compass,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export default function TenantProjectsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    code: "",
    location: "",
    propertyType: "APARTMENT",
    unitCategories: "2BHK, 3BHK, Penthouse",
    priceMin: "450000",
    priceMax: "1250000",
    description: "",
  });

  const fetchProjects = () => {
    setIsLoading(true);
    fetch(`/api/tenant/projects?orgSlug=${slug}`)
      .then((res) => res.json())
      .then((d) => {
        setProjects(d.projects || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, [slug]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tenant/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug: slug, ...form }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setForm({
          name: "",
          code: "",
          location: "",
          propertyType: "APARTMENT",
          unitCategories: "2BHK, 3BHK, Penthouse",
          priceMin: "450000",
          priceMax: "1250000",
          description: "",
        });
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Real Estate Developments & Inventory
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage residential, commercial, and mixed-use property portfolios.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="bg-[var(--primary,#2563EB)] text-white font-bold shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Development
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Loading Projects...
          </p>
        </div>
      ) : projects.length === 0 ? (
        <Card className="bg-white border-slate-200/80">
          <CardContent className="py-16 text-center text-slate-400">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No developments added yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-5">
              Add your premier towers, villas, or commercial complexes to start attaching inquiries and booking units.
            </p>
            <Button onClick={() => setIsModalOpen(true)} variant="primary">
              <Plus className="w-4 h-4 mr-1.5" />
              Create First Development
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj: any) => (
            <Card
              key={proj.id}
              hover
              className="bg-white border-slate-200/80 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Decorative architectural banner */}
                <div className="h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-5 flex flex-col justify-between relative overflow-hidden text-white">
                  <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                    <Building className="w-36 h-36" />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-white/10 backdrop-blur-md uppercase border border-white/10">
                      {proj.code || "PRJ-01"}
                    </span>
                    <Badge variant="cyan" withDot>
                      {proj.status}
                    </Badge>
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-extrabold text-lg tracking-tight text-white group-hover:text-blue-200 transition-colors">
                      {proj.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{proj.location}</span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {proj.description || "Premium real estate development with luxury finishes and modern amenities."}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Property Type
                      </span>
                      <span className="font-semibold text-slate-800">{proj.propertyType}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Unit Specs
                      </span>
                      <span className="font-semibold text-slate-800 truncate max-w-[130px] block">
                        {proj.unitCategories || "Apartments"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    Price Range
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700">
                    ${(proj.priceMin || 0).toLocaleString()} - ${(proj.priceMax || 0).toLocaleString()}
                  </span>
                </div>
                <Badge variant="outline" className="font-bold text-[10px]">
                  Verified Development
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal to add development */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Real Estate Project"
        description="Configure unit categories, location, and pricing brackets for sales attribution."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Development Name"
              required
              placeholder="e.g. Skyline Towers & Residences"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Project Code (Optional)"
              placeholder="e.g. SKY-01"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prime Location"
              required
              placeholder="e.g. Downtown Blvd, Sector 42"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Property Classification
              </label>
              <select
                value={form.propertyType}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200/90 bg-white text-slate-800 outline-none"
              >
                <option value="APARTMENT">Luxury Apartments / Condos</option>
                <option value="VILLA">Private Villas & Estates</option>
                <option value="PLOT">Commercial / Residential Plots</option>
                <option value="COMMERCIAL">Office Spaces & Retail</option>
                <option value="PENTHOUSE">Sky Penthouses</option>
              </select>
            </div>
          </div>

          <Input
            label="Unit Categories (Comma-separated)"
            placeholder="2BHK, 3BHK, 4BHK Penthouse"
            value={form.unitCategories}
            onChange={(e) => setForm({ ...form, unitCategories: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Min Price ($)"
              type="number"
              value={form.priceMin}
              onChange={(e) => setForm({ ...form, priceMin: e.target.value })}
            />
            <Input
              label="Max Price ($)"
              type="number"
              value={form.priceMax}
              onChange={(e) => setForm({ ...form, priceMax: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Description
            </label>
            <textarea
              rows={3}
              placeholder="Key architectural highlights, clubhouse amenities, possession date..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200/90 bg-white text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Launch Development
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
