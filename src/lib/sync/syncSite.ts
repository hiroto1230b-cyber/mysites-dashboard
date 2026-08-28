import type { SupabaseClient } from "@supabase/supabase-js";
import type { Site } from "@/types/site";

interface SiteStatsResponse {
  site?: string;
  pv?: number;
  pv_today?: number;
  pv_total?: number;
  revenue?: number;
  updated_at?: string;
}

const FETCH_TIMEOUT_MS = 10_000;

export interface SyncResult {
  siteId: string;
  ok: boolean;
  error?: string;
}

function currentMonthStart() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function todayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export async function syncSite(
  supabase: SupabaseClient,
  site: Pick<Site, "id" | "user_id" | "custom_api_url" | "api_secret_key">
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

    const hasRevenue = typeof data.revenue === "number";

    const { error } = await supabase
      .from("sites")
      .update({
        pv: data.pv,
        pv_today: data.pv_today ?? 0,
        pv_total: data.pv_total ?? 0,
        ...(hasRevenue ? { revenue: data.revenue } : {}),
        status: "active",
        last_synced_at: new Date().toISOString(),
        last_sync_error: null,
      })
      .eq("id", site.id);

    if (error) throw new Error(error.message);

    const monthStart = currentMonthStart();

    await supabase.from("pv_history").upsert(
      { site_id: site.id, user_id: site.user_id, year_month: monthStart, pv: data.pv },
      { onConflict: "site_id,year_month" }
    );

    // 週次表示のため、本日分のpv_todayを日付ごとに蓄積する。
    // 1日に複数回同期しても同じ日付の行は上書きされる(その日最後の値になる)。
    await supabase.from("pv_daily").upsert(
      { site_id: site.id, user_id: site.user_id, date: todayDate(), pv_today: data.pv_today ?? 0 },
      { onConflict: "site_id,date" }
    );

    // APIがrevenueを返すサイト(Stripe等の自動取得)のみ、revenue_historyも自動更新する。
    // 手動記録のサイトはここで上書きしない。
    if (hasRevenue) {
      await supabase.from("revenue_history").upsert(
        { site_id: site.id, user_id: site.user_id, year_month: monthStart, revenue: data.revenue },
        { onConflict: "site_id,year_month" }
      );
    }

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
