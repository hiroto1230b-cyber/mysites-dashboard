import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { syncSite } from "@/lib/sync/syncSite";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: sites, error } = await supabase
    .from("sites")
    .select("id, custom_api_url, api_secret_key")
    .eq("status", "active");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!sites || sites.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const results = await Promise.allSettled(sites.map((site) => syncSite(supabase, site)));

  const settled = results.map((r, i) =>
    r.status === "fulfilled" ? r.value : { siteId: sites[i].id, ok: false, error: "同期に失敗しました" }
  );

  return NextResponse.json({ results: settled });
}
