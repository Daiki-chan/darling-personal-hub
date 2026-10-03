import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfigStatus, normalizeSupabaseUrl } from "./config";
import type { Database } from "./types";

let adminClient: SupabaseClient<Database> | null = null;

export function getAdminSupabase(): SupabaseClient<Database> | null {
  const status = getSupabaseConfigStatus();
  if (!status.hasUrl || !status.hasServiceRoleKey || !status.url) {
    return null;
  }

  if (adminClient) {
    return adminClient;
  }

  const url = normalizeSupabaseUrl(status.url);
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();

  adminClient = createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
