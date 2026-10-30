const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function fetchEvaluation(date, cutoffPreset = "day_ahead_11am", customCutoff = null, signal = null) {
  const params = new URLSearchParams({
    date,
    cutoff_preset: cutoffPreset
  });
  if (customCutoff) {
    params.append("custom_cutoff", customCutoff);
  }
  const url = `${API_BASE}/api/procurement/evaluation?${params.toString()}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server responded with ${res.status}`);
  }
  return res.json();
}

export async function fetchVintages(startTime) {
  const params = new URLSearchParams({ start_time: startTime });
  const url = `${API_BASE}/api/procurement/vintages?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load forecast publication vintages`);
  }
  return res.json();
}

export async function fetchSystemStatus() {
  const url = `${API_BASE}/api/procurement/status`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to check system health");
  }
  return res.json();
}

export function getExportUrl(date, cutoffPreset = "day_ahead_11am", customCutoff = null) {
  const params = new URLSearchParams({
    date,
    cutoff_preset: cutoffPreset
  });
  if (customCutoff) {
    params.append("custom_cutoff", customCutoff);
  }
  return `${API_BASE}/api/procurement/export?${params.toString()}`;
}

