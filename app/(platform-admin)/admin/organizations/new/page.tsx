"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Palette,
  UserCheck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  UploadCloud,
  X,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

export default function NewOrganizationPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Business Info
    name: "",
    slug: "",
    businessType: "Residential & Commercial Builder",
    businessEmail: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "USA",

    // Step 2: Branding & Logo
    logoUrl: "",
    primaryColor: "#2563EB",
    secondaryColor: "#1E40AF",
    accentColor: "#EA580C",

    // Step 3: Owner Account
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerPassword: "Password123!",

    // Step 4: Subscription
    planId: "GROWTH",
  });

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload/logo", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to upload logo to Supabase storage");
      }

      setFormData((prev) => ({ ...prev, logoUrl: json.url }));
    } catch (err: any) {
      setError(err.message || "Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: "" }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.slug || !formData.businessEmail)) {
      setError("Please provide company name, workspace slug, and business email.");
      return;
    }
    if (step === 3 && (!formData.ownerName || !formData.ownerEmail)) {
      setError("Please provide owner full name and authorized email.");
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, 5));
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to provision organization");
      }

      router.push("/admin/organizations");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Onboard Real Estate Organization</h2>
        <p className="text-sm text-slate-500 mt-1">
          Deploy an isolated white-label workspace for a real estate builder or developer.
        </p>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { num: 1, title: "Business Info", icon: Building2 },
          { num: 2, title: "Branding", icon: Palette },
          { num: 3, title: "Owner Account", icon: UserCheck },
          { num: 4, title: "Subscription", icon: CreditCard },
          { num: 5, title: "Review & Deploy", icon: CheckCircle2 },
        ].map((s) => {
          const Icon = s.icon;
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left transition-all ${
                s.num < step ? "cursor-pointer" : ""
              } ${
                isCurrent
                  ? "bg-blue-50/60 border-blue-600 text-blue-700 shadow-xs"
                  : isDone
                  ? "bg-emerald-50/50 border-emerald-300 text-emerald-700"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isCurrent
                    ? "bg-blue-600 text-white"
                    : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden sm:block overflow-hidden">
                <span className="block text-xs font-semibold truncate">{s.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 1: Business Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Business Information</CardTitle>
            <CardDescription>Primary builder entity registration and contact details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company / Developer Name *"
                placeholder="e.g. Krish Real Estate"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
              <Input
                label="Workspace URL Slug *"
                placeholder="krish-real-estate"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                helperText="Tenant URL: /org/[slug]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business Type"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                placeholder="e.g. Luxury Builder, Commercial Developer"
              />
              <Input
                label="Official Business Email *"
                type="email"
                placeholder="sales@krishrealestate.com"
                value={formData.businessEmail}
                onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business Phone"
                placeholder="+1-555-0199"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Website URL"
                placeholder="https://krishrealestate.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <Input
              label="Headquarters Address"
              placeholder="100 Grand Boulevard, Suite 400"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                placeholder="Austin"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="State"
                placeholder="Texas"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              <Input
                label="Country"
                placeholder="USA"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Branding & Logo */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: White-Label Visual Identity & Logo</CardTitle>
            <CardDescription>Upload the builder&apos;s corporate logo and configure primary brand colors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload Section */}
            <div className="p-5 border border-slate-200/80 rounded-2xl bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Company Logo (Supabase Storage)
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload PNG, JPG, WebP, or SVG. Replaces default letter initials across workspace.
                  </p>
                </div>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove Logo
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
                id="logo-upload-input"
              />

              {formData.logoUrl ? (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-xs flex-shrink-0">
                    <img
                      src={formData.logoUrl}
                      alt="Uploaded Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Uploaded to Supabase
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-500 truncate mt-1">
                      {formData.logoUrl}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-blue-50/30 group"
                >
                  {isUploadingLogo ? (
                    <div className="flex flex-col items-center justify-center py-2">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                      <p className="text-xs font-semibold text-slate-700">Uploading logo to Supabase Storage...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        Click to upload logo or drag and drop
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PNG, JPG, SVG or WebP (max 5MB) • Stored permanently in Supabase
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Colors Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Accent / CTA Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <Input
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Live Theme Preview */}
            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Live Theme Preview
              </span>
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  {/* LOGO REPLACES THE INITIALS BADGE */}
                  {formData.logoUrl ? (
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs overflow-hidden flex-shrink-0">
                      <img
                        src={formData.logoUrl}
                        alt={formData.name || "Logo"}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs flex-shrink-0"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      {formData.name
                        ? formData.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "KR"}
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-slate-900 text-base leading-tight">
                      {formData.name || "Krish Real Estate"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">White-Labeled Sales Portal</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Primary Button
                  </span>
                  <span
                    className="px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs"
                    style={{ backgroundColor: formData.accentColor }}
                  >
                    Action CTA
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Business Owner Account */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Initial Business Owner Account</CardTitle>
            <CardDescription>
              Create credentials for the executive administrator who will manage this builder&apos;s organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Owner Full Name *"
                placeholder="Rajesh Sharma"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                required
              />
              <Input
                label="Owner Login Email *"
                type="email"
                placeholder="rajesh@krishrealestate.com"
                value={formData.ownerEmail}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Owner Phone Number"
                placeholder="+1-555-0188"
                value={formData.ownerPhone}
                onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
              />
              <Input
                label="Initial Password *"
                type="password"
                value={formData.ownerPassword}
                onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Subscription Plan */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Assign Subscription Plan</CardTitle>
            <CardDescription>Determine monthly lead volume limits and team employee seats.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: "STARTER",
                  title: "Starter",
                  price: "$79/mo",
                  employees: "3 Sales Agents",
                  leads: "150 Leads / Mo",
                  features: "Core CRM, Basic Export",
                },
                {
                  id: "GROWTH",
                  title: "Growth (Popular)",
                  price: "$199/mo",
                  employees: "15 Sales Agents",
                  leads: "1,500 Leads / Mo",
                  features: "Meta Ads Sync, Auto-Assign, Full White-Label",
                },
                {
                  id: "ENTERPRISE",
                  title: "Enterprise",
                  price: "$499/mo",
                  employees: "100 Sales Agents",
                  leads: "10,000 Leads / Mo",
                  features: "Priority SLA, Custom Domains, Unlimited Webhooks",
                },
              ].map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setFormData({ ...formData, planId: plan.id })}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    formData.planId === plan.id
                      ? "border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-600/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="font-bold text-slate-900 text-base block">{plan.title}</span>
                  <span className="text-2xl font-black text-blue-600 mt-1 block">{plan.price}</span>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 font-medium">
                    <p>• {plan.employees}</p>
                    <p>• {plan.leads}</p>
                    <p className="text-slate-500 font-normal">• {plan.features}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review & Deploy */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 5: Review & Confirm Provisioning</CardTitle>
            <CardDescription>Verify multi-tenant isolation parameters before deployment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-5 rounded-2xl space-y-2.5 text-sm text-slate-700 border border-slate-200/80">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="text-slate-500 font-medium">Company Name:</span>
                <span className="font-bold text-slate-900">{formData.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="text-slate-500 font-medium">Workspace URL:</span>
                <span className="font-mono text-blue-600 font-semibold">/org/{formData.slug}</span>
              </div>
              {formData.logoUrl && (
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500 font-medium">Company Logo:</span>
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center">
                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="text-slate-500 font-medium">Business Owner:</span>
                <span className="font-semibold text-slate-900">
                  {formData.ownerName} ({formData.ownerEmail})
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="text-slate-500 font-medium">Subscription Tier:</span>
                <span className="font-bold text-purple-700">{formData.planId}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 font-medium">Brand Palette:</span>
                <div className="flex gap-2">
                  <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: formData.primaryColor }}></span>
                  <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: formData.secondaryColor }}></span>
                  <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: formData.accentColor }}></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        {step > 1 ? (
          <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Previous Step
          </Button>
        ) : (
          <div></div>
        )}

        {step < 5 ? (
          <Button variant="primary" onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
            Next Step
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            Deploy Isolated Workspace
            <Sparkles className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
