export type DashboardTab =
  | 'overview'
  | 'services'
  | 'agents'
  | 'terminal';

export interface SystemStatus {
  online: boolean;
  hostname: string;
  kernel: string;
  os: string;
  uptime: string;
  activeDaemonsCount: number;
  totalDaemonsCount: number;
}

export interface Incident {
  id: string;
  service: string;
  level: 'info' | 'warn' | 'error' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  autoHealed?: boolean;
}

export interface SSEEventData<T = unknown> {
  type: 'metrics' | 'log' | 'service_state' | 'incident' | 'ping';
  payload: T;
  timestamp: string;
}
