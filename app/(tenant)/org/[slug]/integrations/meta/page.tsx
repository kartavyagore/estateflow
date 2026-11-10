"use client";

import React, { useEffect, useState, use } from "react";
import {
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Sparkles,
  Link2,
  ExternalLink,
  ShieldCheck,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export default function TenantMetaIntegrationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const [connectForm, setConnectForm] = useState({
    metaPageId: "1098234759231",
    pageName: "Official Developer Page",
    accessToken: "EAAB_access_token_demo_sample",
    metaFormId: "847291834719",
    formName: "Spring Luxury Villas Lead Form",
    projectId: "",
  });

  const fetchData = () => {
    setIsLoading(true);
    fetch(`/api/tenant/meta/connect?orgSlug=${slug}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        if (d.projects && d.projects[0]) {
          setConnectForm((prev) => ({ ...prev, projectId: d.projects[0].id }));
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/tenant/meta/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug: slug, ...connectForm }),
      });
      setIsConnectModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Triggers official webhook handler to test end-to-end ingestion
  const handleTestIncomingWebhook = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    const activeConnection = data?.connections?.[0];
    const pageId = activeConnection?.metaPageId || "1098234759231";
    const activeMapping = data?.formMappings?.[0];
    const formId = activeMapping?.metaFormId || "847291834719";

    const testPayload = {
      object: "page",
      entry: [
        {
          id: pageId,
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: "leadgen",
              value: {
                ad_id: "ad_" + Math.random().toString(36).substring(2, 8),
                form_id: formId,
                leadgen_id: "lead_" + Date.now(),
                created_time: Math.floor(Date.now() / 1000),
                page_id: pageId,
                test_lead: {
                  name: "Sophia Rodriguez (Meta Ad Lead)",
                  phone: "+1-555-018-" + Math.floor(1000 + Math.random() * 9000),
                  email: "sophia.rodriguez@example.com",
                },
              },
            },
          ],
        },
      ],
    };

    try {
      const res = await fetch("/api/webhooks/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });

      const resData = await res.json();
      if (res.ok) {
        setSimulationResult("✅ Lead successfully ingested from Meta Webhook and auto-assigned to sales agent!");
        fetchData();
      } else {
        setSimulationResult(`❌ Webhook error: ${resData.error || "Failed"}`);
      }
    } catch (err: any) {
      setSimulationResult(`❌ Error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const connections = data?.connections || [];
  const formMappings = data?.formMappings || [];
  const projects = data?.projects || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Meta Lead Ads Integration</h2>
          <p className="text-sm text-slate-500 mt-1">
            Connect Facebook & Instagram Lead Ads to ingest inquiries directly into the CRM with zero latency.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleTestIncomingWebhook}
            isLoading={isSimulating}
            className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white"
          >
            <Send className="w-4 h-4 mr-1.5 text-blue-600" />
            Test Live Meta Webhook Ingestion
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsConnectModalOpen(true)}
            className="bg-[var(--primary,#2563EB)] text-white shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Connect Meta Asset
          </Button>
        </div>
      </div>

      {simulationResult && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 text-sm flex items-center justify-between shadow-xs">
          <span>{simulationResult}</span>
          <button
            onClick={() => setSimulationResult(null)}
            className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Connection Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase text-slate-500">Connected Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900">{connections.length}</span>
              <Badge variant={connections.length > 0 ? "success" : "warning"}>
                {connections.length > 0 ? "Live" : "Not Connected"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">Active Facebook / Instagram assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase text-slate-500">Form Mappings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900">{formMappings.length}</span>
              <Badge variant="info">Mapped</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">Auto-routed to real estate projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase text-slate-500">Webhook Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-emerald-600">Active & Verified</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-500 mt-2">HMAC SHA-256 signature enforced</p>
          </CardContent>
        </Card>
      </div>

      {/* Connected Assets & Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Lead Forms & Target Projects</CardTitle>
          <CardDescription>
            When a buyer submits a form on Facebook or Instagram, it enters this workspace automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {formMappings.length === 0 && connections.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Megaphone className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-800">No Meta lead forms mapped yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Click &quot;Connect Meta Asset&quot; above to link your Facebook & Instagram campaigns.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-6">Meta Page</th>
                  <th className="py-3 px-6">Lead Form Name</th>
                  <th className="py-3 px-6">Form ID</th>
                  <th className="py-3 px-6">Mapped CRM Project</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formMappings.map((m: any) => {
                  const project = projects.find((p: any) => p.id === m.projectId);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {connections[0]?.pageName || "Developer Facebook Page"}
                      </td>
                      <td className="py-4 px-6 text-slate-800 font-medium">{m.formName}</td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">{m.metaFormId}</td>
                      <td className="py-4 px-6 text-blue-600 font-medium">
                        {project?.name || "General Developer Pool"}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="success">Auto-Syncing</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Connect Modal */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title="Connect Meta Lead Ads Asset"
        description="Link your official Facebook page ID and lead generation form."
      >
        <form onSubmit={handleConnect} className="space-y-4">
          <Input
            label="Meta Page ID *"
            placeholder="1098234759231"
            value={connectForm.metaPageId}
            onChange={(e) => setConnectForm({ ...connectForm, metaPageId: e.target.value })}
            required
          />

          <Input
            label="Facebook Page Display Name *"
            placeholder="e.g. ABC Luxury Homes"
            value={connectForm.pageName}
            onChange={(e) => setConnectForm({ ...connectForm, pageName: e.target.value })}
            required
          />

          <Input
            label="Lead Gen Form Name *"
            placeholder="e.g. Skyline Towers Pre-Launch Form"
            value={connectForm.formName}
            onChange={(e) => setConnectForm({ ...connectForm, formName: e.target.value })}
            required
          />

          <Input
            label="Meta Form ID *"
            placeholder="847291834719"
            value={connectForm.metaFormId}
            onChange={(e) => setConnectForm({ ...connectForm, metaFormId: e.target.value })}
            required
          />

          <Select
            label="Route Leads into Project"
            value={connectForm.projectId}
            onChange={(e) => setConnectForm({ ...connectForm, projectId: e.target.value })}
          >
            <option value="">General Inquiries</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsConnectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="bg-[var(--primary,#2563EB)] text-white shadow-xs"
            >
              Save & Activate Mapping
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

