"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  Cpu,
  Database,
  HardDrive,
  Server,
} from "lucide-react";
import type { Telemetry } from "@/lib/telemetry";
import { MetricCard } from "@/components/metric-card";

function formatBytes(bytes: number | null) {
  if (bytes === null) return "Unavailable";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

export function LiveDashboard() {
  const [data, setData] = useState<Telemetry | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadTelemetry() {
    try {
      const response = await fetch("/api/admin/telemetry", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Telemetry unavailable");
      }

      const result = (await response.json()) as Telemetry;

      setData(result);
      setError(null);
    } catch {
      setError("Tidak dapat mengambil data server");
    }
  }

  useEffect(() => {
    loadTelemetry();

    const interval = setInterval(loadTelemetry, 10_000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-5 text-rose-300">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">
        Mengambil data server...
      </div>
    );
  }

  const statusLabel = {
    operational: "Operational",
    warning: "Warning",
    critical: "Critical",
  }[data.status];

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-cyan-300">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            System dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Updated {formatDate(data.updatedAt)}
          </p>
        </div>

        <div
          className={`flex items-center gap-2 text-sm ${
            data.status === "operational"
              ? "text-emerald-300"
              : data.status === "warning"
                ? "text-amber-300"
                : "text-rose-300"
          }`}
        >
          <span className="status-dot bg-current" />
          {statusLabel}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="CPU usage"
          value={
            data.cpuPercent === null ? "N/A" : `${data.cpuPercent}%`
          }
          detail="Live server reading"
          icon={Cpu}
          status={
            data.cpuPercent !== null && data.cpuPercent >= 80
              ? "warning"
              : "normal"
          }
        />

        <MetricCard
          label="Memory"
          value={
            data.memoryPercent === null
              ? "N/A"
              : `${data.memoryPercent}%`
          }
          detail={
            data.memoryTotalBytes !== null
              ? `${formatBytes(data.memoryUsedBytes)} / ${formatBytes(data.memoryTotalBytes)}`
              : "Live server reading"
          }
          icon={Database}
          status={
            data.memoryPercent !== null && data.memoryPercent >= 80
              ? "warning"
              : "normal"
          }
        />

        <MetricCard
          label="Storage"
          value={
            data.storagePercent === null
              ? "N/A"
              : `${data.storagePercent}%`
          }
          detail={
            data.storageTotalBytes !== null
              ? `${formatBytes(data.storageUsedBytes)} / ${formatBytes(data.storageTotalBytes)}`
              : "Live server reading"
          }
          icon={HardDrive}
          status={
            data.storagePercent !== null && data.storagePercent >= 80
              ? "warning"
              : "normal"
          }
        />

        <MetricCard
          label="Uptime"
          value={data.uptimeHuman}
          detail="From operating system"
          icon={Clock3}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="dashboard-card p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
              <Server size={19} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Services</h2>
              <p className="text-sm text-slate-500">
                Status dari systemd
              </p>
            </div>
          </div>

          {data.services.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada service yang dikonfigurasi.
            </p>
          ) : (
            <div className="space-y-3">
              {data.services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 p-4"
                >
                  <span className="font-mono text-sm text-slate-300">
                    {service.name}
                  </span>

                  <span
                    className={`flex items-center gap-2 text-sm ${
                      service.status === "online"
                        ? "text-emerald-300"
                        : service.status === "offline"
                          ? "text-rose-300"
                          : "text-amber-300"
                    }`}
                  >
                    <span className="status-dot bg-current" />
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-card p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-amber-400/10 p-3 text-amber-300">
              <AlertTriangle size={19} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Monitoring</h2>
              <p className="text-sm text-slate-500">
                Data aktual dari server
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Telemetry interval</span>
              <span className="text-white">10 seconds</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Data source</span>
              <span className="text-white">Linux host</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">API status</span>
              <span className="flex items-center gap-2 text-emerald-300">
                <Activity size={15} />
                Connected
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
