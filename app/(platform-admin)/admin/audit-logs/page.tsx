"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, RefreshCw, Lock, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = () => {
    setIsLoading(true);
    fetch("/api/admin/audit-logs")
      .then((res) => res.json())
      .then((d) => {
        setLogs(d.logs || []);
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Platform Security & Audit Trail</h2>
          <p className="text-sm text-slate-500 mt-1">
            Immutable log of cross-tenant administrative actions, status changes, and authentication events.
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} isLoading={isLoading}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh Audit Trail
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Events</CardTitle>
          <CardDescription>Records are preserved for compliance, tenant isolation verification, and security.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {logs.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-700">No security audit logs recorded yet</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-6">Action</th>
                  <th className="py-3 px-6">Resource</th>
                  <th className="py-3 px-6">Tenant / Org</th>
                  <th className="py-3 px-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6 text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-6">
                      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-xs font-medium text-slate-700">{log.resourceType}</td>
                    <td className="py-3 px-6 text-xs text-slate-500 font-mono">
                      {log.organizationId || "Global Platform"}
                    </td>
                    <td className="py-3 px-6 font-mono text-xs text-slate-500 max-w-sm truncate">
                      {log.details ? JSON.stringify(log.details) : "-"}
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

