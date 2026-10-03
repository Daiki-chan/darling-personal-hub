// ==============================================================================
// DARLING PERSONAL HUB — SUPABASE ENVIRONMENT & CONFIGURATION MANAGER
// ==============================================================================

export type SupabaseConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
};

export type SupabaseConfigStatus = {
  isConfigured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  hasServiceRoleKey: boolean;
  missing: string[];
  url?: string;
};

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const hasUrl = Boolean(url && url.trim().length > 0 && !url.includes("placeholder") && !url.includes("your-project"));
  const hasAnonKey = Boolean(anonKey && anonKey.trim().length > 0 && !anonKey.includes("placeholder"));
  const hasServiceRoleKey = Boolean(serviceRoleKey && serviceRoleKey.trim().length > 0 && !serviceRoleKey.includes("placeholder"));

  const missing: string[] = [];
  if (!hasUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!hasAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return {
    isConfigured: hasUrl && hasAnonKey,
    hasUrl,
    hasAnonKey,
    hasServiceRoleKey,
    missing,
    url: hasUrl ? url : undefined,
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfigStatus().isConfigured;
}

export function normalizeSupabaseUrl(rawUrl: string): string {
  let cleaned = rawUrl.trim();
  cleaned = cleaned.replace(/\/+$/, "");
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, "").replace(/\/rest\/?$/, "");
  return cleaned;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const status = getSupabaseConfigStatus();
  if (!status.isConfigured || !status.url) {
    return null;
  }

  return {
    url: normalizeSupabaseUrl(status.url),
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  };
}
