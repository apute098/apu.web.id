import os from "node:os";
import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type ServiceStatus = {
  name: string;
  status: "online" | "offline" | "unknown";
};

export type Telemetry = {
  updatedAt: string;
  status: "operational" | "warning" | "critical";
  uptimeSeconds: number;
  uptimeHuman: string;
  cpuPercent: number | null;
  memoryPercent: number | null;
  memoryUsedBytes: number | null;
  memoryTotalBytes: number | null;
  storagePercent: number | null;
  storageUsedBytes: number | null;
  storageTotalBytes: number | null;
  services: ServiceStatus[];
};

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${days}d ${hours}h ${minutes}m`;
}

async function readCpuStats() {
  const content = await fs.readFile("/proc/stat", "utf8");
  const line = content
    .split("\n")
    .find((item) => item.startsWith("cpu "));

  if (!line) {
    throw new Error("CPU statistics unavailable");
  }

  const values = line
    .trim()
    .split(/\s+/)
    .slice(1)
    .map(Number);

  const idle = values[3] + (values[4] || 0);
  const total = values.reduce((sum, value) => sum + value, 0);

  return { idle, total };
}

async function getCpuPercent(): Promise<number | null> {
  try {
    const first = await readCpuStats();

    await new Promise((resolve) => setTimeout(resolve, 150));

    const second = await readCpuStats();

    const idleDelta = second.idle - first.idle;
    const totalDelta = second.total - first.total;

    if (totalDelta <= 0) {
      return null;
    }

    const usage = 100 * (1 - idleDelta / totalDelta);

    return Math.round(Math.max(0, Math.min(100, usage)));
  } catch {
    return null;
  }
}

function getMemoryStats() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;

  return {
    total,
    used,
    percent: Math.round((used / total) * 100),
  };
}

async function getStorageStats() {
  try {
    const { stdout } = await execFileAsync("df", ["-Pk", "/"]);

    const lines = stdout.trim().split("\n");

    if (lines.length < 2) {
      return null;
    }

    const columns = lines[1].trim().split(/\s+/);

    const totalKb = Number(columns[1]);
    const usedKb = Number(columns[2]);
    const percent = Number.parseInt(columns[4].replace("%", ""), 10);

    if (
      !Number.isFinite(totalKb) ||
      !Number.isFinite(usedKb) ||
      !Number.isFinite(percent)
    ) {
      return null;
    }

    return {
      total: totalKb * 1024,
      used: usedKb * 1024,
      percent,
    };
  } catch {
    return null;
  }
}

async function getServiceStatus(
  serviceName: string,
): Promise<ServiceStatus> {
  try {
    await execFileAsync("systemctl", [
      "is-active",
      "--quiet",
      serviceName,
    ]);

    return {
      name: serviceName,
      status: "online",
    };
  } catch (error: unknown) {
    const exitCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? Number(error.code)
        : null;

    if (exitCode === 3) {
      return {
        name: serviceName,
        status: "offline",
      };
    }

    return {
      name: serviceName,
      status: "unknown",
    };
  }
}

async function getServices(): Promise<ServiceStatus[]> {
  const configuredServices = process.env.MONITORED_SERVICES
    ?.split(",")
    .map((service) => service.trim())
    .filter(Boolean);

  if (!configuredServices?.length) {
    return [];
  }

  return Promise.all(
    configuredServices.map((service) => getServiceStatus(service)),
  );
}

export async function getTelemetry(): Promise<Telemetry> {
  const [cpuPercent, storage, services] = await Promise.all([
    getCpuPercent(),
    getStorageStats(),
    getServices(),
  ]);

  const memory = getMemoryStats();

  const hasOfflineService = services.some(
    (service) => service.status === "offline",
  );

  const hasUnknownService = services.some(
    (service) => service.status === "unknown",
  );

  const hasCriticalResource =
    (cpuPercent !== null && cpuPercent >= 95) ||
    memory.percent >= 95 ||
    (storage !== null && storage.percent >= 95);

  const hasWarningResource =
    (cpuPercent !== null && cpuPercent >= 80) ||
    memory.percent >= 80 ||
    (storage !== null && storage.percent >= 80);

  let status: Telemetry["status"] = "operational";

  if (hasCriticalResource || hasOfflineService) {
    status = "critical";
  } else if (hasWarningResource || hasUnknownService) {
    status = "warning";
  }

  return {
    updatedAt: new Date().toISOString(),
    status,
    uptimeSeconds: Math.floor(os.uptime()),
    uptimeHuman: formatUptime(os.uptime()),
    cpuPercent,
    memoryPercent: memory.percent,
    memoryUsedBytes: memory.used,
    memoryTotalBytes: memory.total,
    storagePercent: storage?.percent ?? null,
    storageUsedBytes: storage?.used ?? null,
    storageTotalBytes: storage?.total ?? null,
    services,
  };
}
