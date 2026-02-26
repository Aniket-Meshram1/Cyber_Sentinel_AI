// frontend/lib/api.ts

const API_BASE_URL = "http://127.0.0.1:5000";

/**
 * Defines the structure for the main statistics object from the backend.
 */
export interface SystemStats {
  total_flows: number;
  normal: number;
  attacks: number;
  recent_attack_ratio: number;
  status: "SAFE" | "THREAT";
}

/**
 * Defines the structure for a single alert entry from the backend.
 * Note: This is different from the simulated AlertEntry and does not contain IP/protocol.
 */
export interface ApiAlert {
  model_used: string;
  prediction: 0 | 1;
  label: "Normal" | "DDoS Attack";
  timestamp: string;
  source_ip?: string;
  destination_ip?: string;
  protocol?: string;
}

/**
 * Fetches the main system statistics from the backend.
 */
export async function fetchStats(): Promise<SystemStats> {
  const response = await fetch(`${API_BASE_URL}/api/stats`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch system stats: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetches the list of recent alerts from the backend.
 */
export async function fetchAlerts(): Promise<ApiAlert[]> {
  const response = await fetch(`${API_BASE_URL}/api/alerts`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.statusText}`);
  }
  const alerts: ApiAlert[] = await response.json();
  // Reverse to show the most recent alerts first
  return alerts.reverse();
}