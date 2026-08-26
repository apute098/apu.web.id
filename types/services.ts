export type ServiceCategory = 'ai' | 'web' | 'core' | 'bot' | 'network' | 'all';
export type ServiceStatus = 'active' | 'inactive' | 'failed' | 'activating' | 'unknown';
export type ServiceAction = 'start' | 'stop' | 'restart' | 'reload';

export interface ServiceItem {
  id: string;
  name: string;
  unit: string;
  scope: 'system' | 'user';
  category: ServiceCategory;
  status: ServiceStatus;
  subState: string;
  memoryMB: number;
  pid: number | null;
  uptime: string;
  description: string;
}

export interface ServicesSummary {
  total: number;
  active: number;
  failed: number;
  inactive: number;
}

export interface ServicesResponse {
  success: boolean;
  summary: ServicesSummary;
  services: ServiceItem[];
  timestamp: string;
  error?: string;
}

export interface ServiceActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  output?: string;
  service?: ServiceItem | null;
}
