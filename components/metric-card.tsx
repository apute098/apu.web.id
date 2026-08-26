"use client";

import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  status?: "normal" | "warning" | "critical";
};

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  status = "normal",
}: MetricCardProps) {
  const borderColor =
    status === "warning"
      ? "border-amber-400/30"
      : status === "critical"
        ? "border-rose-400/30"
        : "border-slate-800";

  const iconBg =
    status === "warning"
      ? "bg-amber-400/10 text-amber-300"
      : status === "critical"
        ? "bg-rose-400/10 text-rose-300"
        : "bg-cyan-400/10 text-cyan-300";

  return (
    <div
      className={`rounded-xl border ${borderColor} bg-slate-950/50 p-5`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <div className={`rounded-lg p-2 ${iconBg}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {detail && (
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      )}
    </div>
  );
}
