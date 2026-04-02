const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cyber-sentinel-ai-1.onrender.com/api";

// Generic safe API handler
async function safeApiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 3
): Promise<{ data: T | null; error: string | null }> {
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Success
      if (res.ok) {
        try {
          const json = await res.json();
          return { data: json, error: null };
        } catch {
          return { data: null, error: "Invalid JSON response" };
        }
      }

      // Don't retry client errors (400–499)
      if (res.status >= 400 && res.status < 500) {
        return { data: null, error: `Client error ${res.status}` };
      }

      // Retry for server errors
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
        continue;
      }

      return { data: null, error: `Server error ${res.status}` };

    } catch (err: any) {
      clearTimeout(timeout);

      // Abort / timeout
      if (err.name === "AbortError") {
        if (i === retries) {
          return { data: null, error: "Request timeout" };
        }
      }

      // Network retry
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
        continue;
      }

      return { data: null, error: "Network error" };
    }
  }

  return { data: null, error: "Unknown error" };
}

// -----------------------------
// Types
// -----------------------------

export interface SystemStats {
  total_flows: number;
  normal: number;
  attacks: number;
  recent_attack_ratio: number;
  status: "SAFE" | "THREAT";
}

export interface ApiAlert {
  model_used: string;
  prediction: 0 | 1;
  label: "Normal" | "DDoS Attack";
  timestamp: string;
  source_ip?: string;
  destination_ip?: string;
  protocol?: string;
}

// -----------------------------
// Fallbacks
// -----------------------------

const FALLBACK_STATS: SystemStats = {
  total_flows: 0,
  normal: 0,
  attacks: 0,
  recent_attack_ratio: 0,
  status: "SAFE",
};

// -----------------------------
// API Functions
// -----------------------------

export async function fetchStats() {
  const { data, error } = await safeApiCall<SystemStats>("/stats");
  return { data: data || FALLBACK_STATS, error };
}

export async function fetchAlerts() {
  const { data, error } = await safeApiCall<ApiAlert[]>("/alerts");
  return { data: data || [], error };
}

export async function getAvailableModels() {
  const { data, error } = await safeApiCall<{ available_models: string[] }>("/health");
  return {
    data: data?.available_models || ["xgboost", "lightgbm"],
    error,
  };
}

// -----------------------------
// Prediction APIs (FIXED)
// -----------------------------

export async function predictFlow(
  flowData: any,
  model = "xgboost"
) {
  const { data, error } = await safeApiCall(
    `/predict?model=${model}`,
    {
      method: "POST",
      body: JSON.stringify(flowData),
    },
    1
  );

  if (error) throw new Error(error);
  return data;
}

export async function predictCSV(
  file: File,
  model = "xgboost"
) {
  const formData = new FormData();
  formData.append("file", file);

  const { data, error } = await safeApiCall(
    `/predict-csv?model=${model}`,
    {
      method: "POST",
      body: formData,
    },
    1
  );

  if (error) throw new Error(error);
  return data;
}

// -----------------------------
// Health check
// -----------------------------

export async function checkBackendHealth(): Promise<boolean> {
  const { data } = await safeApiCall("/health");
  return !!data;
}