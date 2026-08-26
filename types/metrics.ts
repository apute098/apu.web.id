export interface CpuMetrics {
  usage: number;
  temperature?: number;
  cores?: number[];
  model?: string;
  loadAverage: [number, number, number];
}

export interface MemoryMetrics {
  total: number;
  used: number;
  available: number;
  percentage: number;
  swapTotal?: number;
  swapUsed?: number;
  swapPercentage?: number;
}

export interface DiskMetrics {
  total: number;
  used: number;
  free: number;
  percentage: number;
  readSpeedMBs?: number;
  writeSpeedMBs?: number;
}

export interface NetworkInterfaceMetrics {
  name: string;
  rxSpeedKBps: number;
  txSpeedKBps: number;
  totalRxBytes: number;
  totalTxBytes: number;
}

export interface SystemMetrics {
  timestamp: string;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network?: NetworkInterfaceMetrics[];
  uptimeSec: number;
}

export interface MetricsResponse {
  success: boolean;
  metrics: SystemMetrics;
  error?: string;
}
