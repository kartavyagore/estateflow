"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building,
  User,
  Calendar,
  DollarSign,
  Plus,
  Clock,
  CheckCircle2,
  PhoneCall,
  CalendarCheck,
  FileCheck2,
  MessageSquare,
  Sparkles,
  Flame,
  ChevronRight,
  ShieldCheck,
  Home,
  Tag,
  MessageCircle,
  Share2,
  Layers,
  Send,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

const STAGES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "SITE_VISIT_SCHEDULED",
  "SITE_VISIT_COMPLETED",
  "NEGOTIATION",
  "WON_BOOKED",
];

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Forms
  const [callForm, setCallForm] = useState({
    title: "Phone Call with Buyer",
    callOutcome: "INTERESTED",
    description: "",
    nextFollowUpAt: "",
  });

  const [visitForm, setVisitForm] = useState({
    projectId: "",
    scheduledAt: "",
    feedback: "",
    status: "SCHEDULED",
  });

  const [bookingForm, setBookingForm] = useState({
    projectId: "",
    unitNumber: "",
    agreedDealValue: "",
    tokenAmount: "",
    notes: "",
  });

  // WhatsApp Templates
  const [selectedTemplate, setSelectedTemplate] = useState("INTRO");
  const [customWAMessage, setCustomWAMessage] = useState("");

  const fetchLead = () => {
    setIsLoading(true);
    fetch(`/api/tenant/leads/${id}?orgSlug=${slug}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        if (d.projects && d.projects[0]) {
          setVisitForm((prev) => ({ ...prev, projectId: d.projects[0].id }));
          setBookingForm((prev) => ({ ...prev, projectId: d.projects[0].id }));
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchLead();
  }, [slug, id]);

  const lead = data?.lead;

  // Initialize WhatsApp template text
  useEffect(() => {
    if (!lead) return;
    const projName = lead.project?.name || "our luxury developments";
    if (selectedTemplate === "INTRO") {
      setCustomWAMessage(
        `Hello ${lead.name}, thank you for inquiring about ${projName}. I would love to share our latest floor plans and exclusive pricing with you. Are you available for a brief 5-minute call today?`
      );
    } else if (selectedTemplate === "VISIT") {
      setCustomWAMessage(
        `Dear ${lead.name}, we would be delighted to host you for a private site tour at ${projName}. We have prepared sample show flats for your viewing. What time works best for you this weekend?`
      );
    } else if (selectedTemplate === "OFFER") {
      setCustomWAMessage(
        `Hi ${lead.name}, regarding your preferred unit at ${projName}: our management has approved a special priority payment schedule for your consideration. Let me know when you'd like to review the cost sheet.`
      );
    }
  }, [selectedTemplate, lead]);

  const handleLogCall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/tenant/leads/${id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug: slug, type: "CALL", ...callForm }),
      });
      setIsCallModalOpen(false);
      fetchLead();
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/tenant/leads/${id}/site-visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug: slug, ...visitForm }),
      });
      setIsVisitModalOpen(false);
      fetchLead();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/tenant/leads/${id}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug: slug, ...bookingForm }),
      });
      setIsBookingModalOpen(false);
      fetchLead();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await fetch(`/api/tenant/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug: slug, status: newStatus }),
      });
      fetchLead();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Loading Lead Details...
        </p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-24 text-center text-slate-500">
        <p>Inquiry record not found.</p>
        <Link href={`/org/${slug}/leads`} className="text-blue-600 font-bold mt-2 inline-block">
          ← Return to Pipeline
        </Link>
      </div>
    );
  }

  const currentStageIdx = STAGES.indexOf(lead.status);
  const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customWAMessage)}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <Link
          href={`/org/${slug}/leads`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Inquiries</span>
        </Link>
      </div>

      {/* Main Profile Header Banner */}
      <div className="p-6 md:p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              {lead.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{lead.name}</h2>
                {lead.temperature === "HOT" && (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    HOT BUYER
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                <span className="font-mono text-slate-700 font-semibold">{lead.phone}</span>
                {lead.email && <span>• {lead.email}</span>}
                <span>• Source: {lead.source}</span>
                <span>• Assigned: {lead.assignedMember?.user?.name || "Unassigned"}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1-Click WhatsApp Quick Action */}
            <Button
              onClick={() => setIsWhatsAppModalOpen(true)}
              variant="outline"
              size="sm"
              className="bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 border-emerald-300 font-bold"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              WhatsApp Buyer
            </Button>

            <Button
              onClick={() => setIsCallModalOpen(true)}
              variant="outline"
              size="sm"
              className="bg-blue-50/50 hover:bg-blue-50 text-blue-700 border-blue-200 font-semibold"
            >
              <PhoneCall className="w-3.5 h-3.5 mr-1" />
              Log Call
            </Button>
            <Button
              onClick={() => setIsVisitModalOpen(true)}
              variant="outline"
              size="sm"
              className="bg-purple-50/50 hover:bg-purple-50 text-purple-700 border-purple-200 font-semibold"
            >
              <CalendarCheck className="w-3.5 h-3.5 mr-1" />
              Schedule Visit
            </Button>
            <Button
              onClick={() => setIsBookingModalOpen(true)}
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
            >
              <FileCheck2 className="w-3.5 h-3.5 mr-1" />
              Record Booking
            </Button>
          </div>
        </div>

        {/* Stepper Pipeline Timeline */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
            Deal Stage Progression
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {STAGES.map((s, idx) => {
              const isPast = currentStageIdx >= idx;
              const isCurrent = lead.status === s;
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : isPast
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {s.replace(/_/g, " ")}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Details & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Buyer Requirements & Property Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="py-4 px-6">
              <CardTitle>Inquiry Specification & Budget</CardTitle>
              <CardDescription>Target property, financing, and move-in timeline.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-400">Target Development</span>
                <span className="block font-bold text-slate-900 text-base">
                  {lead.project?.name || "General Inquiry"}
                </span>
                <span className="text-xs text-slate-500">{lead.project?.location}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-400">Budget Range</span>
                <span className="block font-extrabold text-emerald-700 text-base">
                  ${(lead.budgetMin || 400000).toLocaleString()} - ${(lead.budgetMax || 750000).toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">Self-Financed / Pre-Approved</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-400">Property Type</span>
                <span className="block font-semibold text-slate-800">{lead.propertyType}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-400">Move-in Timeline</span>
                <span className="block font-semibold text-slate-800">
                  {lead.timeline?.replace(/_/g, " ") || "1-3 Months"}
                </span>
              </div>

              {lead.requirements && (
                <div className="sm:col-span-2 pt-3 border-t border-slate-100 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-slate-400">Special Notes</span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    {lead.requirements}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Construction-Linked Milestone Payment Tracker (Industry Standard) */}
          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/20 to-white">
            <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Construction Milestone Payment Schedule</CardTitle>
                <CardDescription>Milestone breakdown for unit acquisition.</CardDescription>
              </div>
              <Badge variant="purple">Standard Developer Plan</Badge>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                  <span className="block text-[10px] font-bold text-emerald-700 uppercase">1. Booking Token (10%)</span>
                  <span className="text-sm font-extrabold text-emerald-900 mt-1 block">
                    ${Math.round(((lead.budgetMax || 600000) * 0.1)).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 mt-1 block">
                    {lead.bookings?.length > 0 ? "✓ Paid & Confirmed" : "Due Upon Agreement"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">2. Plinth / Foundation (20%)</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                    ${Math.round(((lead.budgetMax || 600000) * 0.2)).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Construction Linked</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">3. Superstructure (40%)</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                    ${Math.round(((lead.budgetMax || 600000) * 0.4)).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Floor Slab Castings</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">4. Handover & Registry (30%)</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                    ${Math.round(((lead.budgetMax || 600000) * 0.3)).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">On Possession</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Section */}
          {lead.bookings && lead.bookings.length > 0 && (
            <Card className="border-emerald-200 bg-emerald-50/20">
              <CardHeader className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-emerald-900">Signed Property Bookings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {lead.bookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm">
                        Unit {booking.unitNumber} • {booking.project?.name}
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5">
                        Token Paid: ${(booking.tokenAmount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-emerald-700">
                        ${(booking.agreedDealValue || 0).toLocaleString()}
                      </span>
                      <Badge variant="success" className="block mt-1">
                        CONFIRMED
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Site Visits History */}
          <Card>
            <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Site Visits & Property Tours</CardTitle>
                <CardDescription>Scheduled and completed visits.</CardDescription>
              </div>
              <Button onClick={() => setIsVisitModalOpen(true)} size="xs" variant="outline">
                + Schedule
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {!lead.siteVisits || lead.siteVisits.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No site visits logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {lead.siteVisits.map((sv: any) => (
                    <div
                      key={sv.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {sv.project?.name || "Development Site"}
                        </span>
                        <span className="text-slate-500">
                          {new Date(sv.scheduledAt).toLocaleString()}
                        </span>
                        {sv.feedback && <p className="text-slate-600 mt-1 italic">"{sv.feedback}"</p>}
                      </div>
                      <Badge variant={sv.status === "COMPLETED" ? "success" : "info"}>
                        {sv.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3): Activity Stream */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-4 px-6">
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Audited interaction history.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!lead.activities || lead.activities.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No activity history yet.</p>
              ) : (
                <div className="space-y-4">
                  {lead.activities.map((act: any) => (
                    <div key={act.id} className="flex gap-3 text-xs">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {act.type === "CALL" ? (
                          <Phone className="w-3.5 h-3.5" />
                        ) : act.type === "BOOKING" ? (
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <span className="font-bold text-slate-900 block">{act.title}</span>
                        <p className="text-slate-600">{act.description}</p>
                        <span className="text-[10px] text-slate-400 block pt-1">
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* WhatsApp Message Template Modal */}
      <Modal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        title="Direct WhatsApp Outreach"
        description="Select a pre-approved template or compose a personalized follow-up."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Real Estate Template
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "INTRO", label: "Floor Plans" },
                { id: "VISIT", label: "Site Tour Invite" },
                { id: "OFFER", label: "Payment Offer" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedTemplate === t.id
                      ? "bg-emerald-50 text-emerald-800 border-emerald-400 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Message Preview
            </label>
            <textarea
              rows={4}
              value={customWAMessage}
              onChange={(e) => setCustomWAMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200/90 bg-white text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsWhatsAppModalOpen(false)}>
              Cancel
            </Button>
            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              <Button
                type="button"
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Launch WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </Modal>

      {/* Log Call Modal */}
      <Modal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        title="Log Buyer Phone Call"
        description="Record phone discussion notes and update lead follow-up date."
      >
        <form onSubmit={handleLogCall} className="space-y-4">
          <Input
            label="Call Title"
            required
            value={callForm.title}
            onChange={(e) => setCallForm({ ...callForm, title: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Call Outcome</label>
            <select
              value={callForm.callOutcome}
              onChange={(e) => setCallForm({ ...callForm, callOutcome: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200/90 bg-white text-slate-800 outline-none"
            >
              <option value="INTERESTED">Highly Interested</option>
              <option value="SITE_VISIT_PROPOSED">Site Visit Proposed</option>
              <option value="CALLBACK_REQUESTED">Requested Callback</option>
              <option value="NOT_INTERESTED">Not Interested / Budget Mismatch</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Discussion Summary
            </label>
            <textarea
              rows={3}
              required
              placeholder="Buyer requested 3BHK high-floor details with balcony view..."
              value={callForm.description}
              onChange={(e) => setCallForm({ ...callForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200/90 bg-white text-slate-800 outline-none"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsCallModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Call Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Visit Modal */}
      <Modal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        title="Schedule Property Site Tour"
        description="Book a dedicated walkthrough at the development site."
      >
        <form onSubmit={handleScheduleVisit} className="space-y-4">
          <Input
            label="Tour Date & Time"
            type="datetime-local"
            required
            value={visitForm.scheduledAt}
            onChange={(e) => setVisitForm({ ...visitForm, scheduledAt: e.target.value })}
          />
          <Input
            label="Special Instructions / Driver Pick-up"
            placeholder="Buyer visiting with spouse on Saturday afternoon..."
            value={visitForm.feedback}
            onChange={(e) => setVisitForm({ ...visitForm, feedback: e.target.value })}
          />
          <div className="pt-2 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsVisitModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Site Visit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Record Confirmed Property Booking"
        description="Finalize sale by specifying unit number and agreed token amount."
      >
        <form onSubmit={handleRecordBooking} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Assigned Unit / Flat Number"
              required
              placeholder="e.g. Tower A - Flat 1402"
              value={bookingForm.unitNumber}
              onChange={(e) => setBookingForm({ ...bookingForm, unitNumber: e.target.value })}
            />
            <Input
              label="Total Agreed Deal Value ($)"
              type="number"
              required
              placeholder="720000"
              value={bookingForm.agreedDealValue}
              onChange={(e) => setBookingForm({ ...bookingForm, agreedDealValue: e.target.value })}
            />
          </div>

          <Input
            label="Initial Token Advance Paid ($)"
            type="number"
            required
            placeholder="50000"
            value={bookingForm.tokenAmount}
            onChange={(e) => setBookingForm({ ...bookingForm, tokenAmount: e.target.value })}
          />

          <div className="pt-2 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Finalize Booking & Close Deal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
