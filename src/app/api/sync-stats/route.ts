import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncSite } from "@/lib/sync/syncSite";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const siteId: string | undefined = body?.siteId;

  let query = supabase
    .from("sites")
    .select("id, custom_api_url, api_secret_key")
    .eq("user_id", user.id)
    .eq("status", "active" as const);

  // 個別同期の場合はステータスに関わらず対象にする
  if (siteId) {
    query = supabase
      .from("sites")
      .select("id, custom_api_url, api_secret_key")
      .eq("user_id", user.id)
      .eq("id", siteId);
  }

  const { data: sites, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!sites || sites.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const results = await Promise.allSettled(
    sites.map((site) => syncSite(supabase, site))
  );

  const settled = results.map((r, i) =>
    r.status === "fulfilled" ? r.value : { siteId: sites[i].id, ok: false, error: "同期に失敗しました" }
  );

  return NextResponse.json({ results: settled });
}
