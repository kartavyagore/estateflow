"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, Check, Sparkles, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/organizations")
      .then((res) => res.json())
      .then((d) => setPlans(d.plans || []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">SaaS Subscription Plans & Quotas</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure commercial tiers, lead thresholds, team seats, and automated feature gates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col justify-between transition-all ${
              plan.isPopular ? "border-blue-600 shadow-md ring-2 ring-blue-600/20" : "hover:border-slate-300"
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge variant="purple" className="shadow-xs font-semibold px-3 py-1">
                  Most Popular for Builders
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100">
                  {plan.name === "STARTER" && <Zap className="w-4 h-4 text-amber-500" />}
                  {plan.name === "GROWTH" && <Sparkles className="w-4 h-4 text-blue-600" />}
                  {plan.name === "ENTERPRISE" && <Shield className="w-4 h-4 text-purple-600" />}
                </div>
              </div>

              <CardDescription className="min-h-[36px]">
                {plan.description}
              </CardDescription>

              <div className="pt-3">
                <span className="text-4xl font-black text-slate-900">${plan.priceMonthly}</span>
                <span className="text-slate-500 text-sm font-semibold"> / month</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-5 flex-1 border-t border-slate-100 bg-slate-50/30">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Plan Inclusions
              </p>
              <div className="space-y-2.5 text-sm text-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Up to <strong>{plan.maxEmployees}</strong> Sales Team Members</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span><strong>{plan.maxMonthlyLeads.toLocaleString()}</strong> CRM Leads / month</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Automated Round-Robin Assignment</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Real Estate Projects & Inventory</span>
                </div>
                {plan.name !== "STARTER" && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Official Meta Lead Ads Webhook Sync</span>
                  </div>
                )}
                {plan.name === "ENTERPRISE" && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Custom CNAME Domain Verification</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
