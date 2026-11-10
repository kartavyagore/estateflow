"use client";

import React, { useEffect, useState } from "react";
import { Webhook, RefreshCw, CheckCircle2, AlertTriangle, Clock, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminWebhooksPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = () => {
    setIsLoading(true);
    fetch("/api/admin/webhooks")
      .then((res) => res.json())
      .then((d) => {
        setEvents(d.events || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Webhook Event Bus</h2>
          <p className="text-sm text-slate-500 mt-1">
            Durable webhook ingestion log for Meta Lead Ads and external CRM webhooks.
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} isLoading={isLoading}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh Stream
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Processed Events</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {events.filter((e) => e.status === "PROCESSED").length}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Pending Ingestion</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {events.filter((e) => e.status === "PENDING").length}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Failed / Dead-Letter</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {events.filter((e) => e.status === "FAILED").length}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Webhook Ingestion Records</CardTitle>
          <CardDescription>All incoming payloads are verified via HMAC SHA-256 before queueing.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {events.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Webhook className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-700">No webhook events logged yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Incoming Meta Lead Ads submissions will stream here in real-time.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-6">Provider</th>
                  <th className="py-3 px-6">Event Type</th>
                  <th className="py-3 px-6">Target Org</th>
                  <th className="py-3 px-6">Retries</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6 text-xs text-slate-500">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-6 font-semibold text-slate-800">{e.provider}</td>
                    <td className="py-3 px-6 font-mono text-xs">{e.eventType}</td>
                    <td className="py-3 px-6 text-xs text-slate-600">{e.organizationId || "System"}</td>
                    <td className="py-3 px-6 text-xs">{e.retryCount}</td>
                    <td className="py-3 px-6">
                      <Badge variant={e.status === "PROCESSED" ? "success" : e.status === "FAILED" ? "danger" : "warning"}>
                        {e.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-6 font-mono text-xs text-slate-500 max-w-xs truncate">
                      {e.payload}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

