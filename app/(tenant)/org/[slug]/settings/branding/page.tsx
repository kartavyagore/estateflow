"use client";

import React, { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Palette, Check, RefreshCw, Sparkles, Building2, Eye, UploadCloud, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TenantBrandingSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [branding, setBranding] = useState({
    businessName: "",
    primaryColor: "#2563EB",
    secondaryColor: "#1E40AF",
    accentColor: "#EA580C",
    welcomeMessage: "",
    supportEmail: "",
    supportPhone: "",
    logoUrl: "",
  });

  useEffect(() => {
    fetch(`/api/tenant/branding?orgSlug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.branding) {
          setBranding({
            businessName: data.orgName || "",
            primaryColor: data.branding.primaryColor || "#2563EB",
            secondaryColor: data.branding.secondaryColor || "#1E40AF",
            accentColor: data.branding.accentColor || "#EA580C",
            welcomeMessage: data.branding.welcomeMessage || "",
            supportEmail: data.branding.supportEmail || "",
            supportPhone: data.branding.supportPhone || "",
            logoUrl: data.branding.logoUrl || "",
          });
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [slug]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

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

      setBranding((prev) => ({ ...prev, logoUrl: json.url }));
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload logo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/tenant/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug: slug, ...branding }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">White-Label Branding Studio</h2>
        <p className="text-sm text-slate-500 mt-1">
          Customize your company logo, dynamic theme colors, and portal messaging in real-time.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Branding saved successfully! Your workspace theme and logo have been updated.</span>
        </div>
      )}

      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Customizer</CardTitle>
            <CardDescription>Changes apply instantly across your organization portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <Input
                label="Company Display Name"
                value={branding.businessName}
                onChange={(e) => setBranding({ ...branding, businessName: e.target.value })}
              />

              {/* Logo Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Company Logo (Supabase Storage)
                  </label>
                  {branding.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setBranding({ ...branding, logoUrl: "" })}
                      className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {branding.logoUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs flex-shrink-0">
                      <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-mono text-slate-500 truncate">{branding.logoUrl}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-blue-50/30"
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2 py-2">
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-xs text-slate-600">Uploading to Supabase Storage...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-1">
                        <UploadCloud className="w-6 h-6 text-blue-600 mb-1.5" />
                        <p className="text-xs font-semibold text-slate-700">Upload Logo</p>
                        <p className="text-[11px] text-slate-400">PNG, JPG, WebP, SVG up to 5MB</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Colors */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Brand Color Palette
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="block text-[11px] text-slate-500 mb-1 font-medium">Primary</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="w-full text-xs font-mono border rounded-lg p-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] text-slate-500 mb-1 font-medium">Secondary</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        className="w-full text-xs font-mono border rounded-lg p-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] text-slate-500 mb-1 font-medium">Accent / CTA</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={branding.accentColor}
                        onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={branding.accentColor}
                        onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                        className="w-full text-xs font-mono border rounded-lg p-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Input
                label="Custom Welcome Greeting"
                placeholder="Welcome to our sales workspace"
                value={branding.welcomeMessage}
                onChange={(e) => setBranding({ ...branding, welcomeMessage: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Support Email"
                  value={branding.supportEmail}
                  onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                />
                <Input
                  label="Support Phone"
                  value={branding.supportPhone}
                  onChange={(e) => setBranding({ ...branding, supportPhone: e.target.value })}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Save Branding Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Live Preview Card */}
        <div className="space-y-4">
          <Card className="border-2 border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Live Portal Preview</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Header Preview */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {branding.logoUrl ? (
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                      <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      {branding.businessName
                        ? branding.businessName
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "EF"}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">
                      {branding.businessName || "Your Company Name"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {branding.welcomeMessage || "Welcome to Real Estate Portal"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Widget */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                <span className="text-xs font-semibold text-slate-600 block">Sample Dashboard KPI</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">48 Active Inquiries</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    +18% MTD
                  </span>
                </div>
              </div>

              {/* Buttons Demo */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  Primary Action
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs"
                  style={{ backgroundColor: branding.accentColor }}
                >
                  High-Priority CTA
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
