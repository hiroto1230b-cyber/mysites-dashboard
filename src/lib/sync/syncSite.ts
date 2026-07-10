import type { SupabaseClient } from "@supabase/supabase-js";
import type { Site } from "@/types/site";

interface SiteStatsResponse {
  site?: string;
  pv?: number;
  pv_today?: number;
  pv_total?: number;
  updated_at?: string;
}

const FETCH_TIMEOUT_MS = 10_000;

export interface SyncResult {
  siteId: string;
  ok: boolean;
  error?: string;
}

export async function syncSite(
  supabase: SupabaseClient,
  site: Pick<Site, "id" | "custom_api_url" | "api_secret_key">
): Promise<SyncResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(site.custom_api_url, {
      headers: { Authorization: `Bearer ${site.api_secret_key}` },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      throw new Error(`APIが ${res.status} を返しました`);
    }

    const data: SiteStatsResponse = await res.json();

    if (typeof data.pv !== "number") {
      throw new Error("レスポンスにpvが含まれていません");
    }

    const { error } = await supabase
      .from("sites")
      .update({
        pv: data.pv,
        pv_today: data.pv_today ?? 0,
        pv_total: data.pv_total ?? 0,
        status: "active",
        last_synced_at: new Date().toISOString(),
        last_sync_error: null,
      })
      .eq("id", site.id);

    if (error) throw new Error(error.message);

    return { siteId: site.id, ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラーが発生しました";

    await supabase
      .from("sites")
      .update({
        status: "error",
        last_synced_at: new Date().toISOString(),
        last_sync_error: message,
      })
      .eq("id", site.id);

    return { siteId: site.id, ok: false, error: message };
  }
}
