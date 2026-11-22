import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteDetailView } from "@/components/dashboard/site-detail-view";
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart";
import { DailyPvChart } from "@/components/dashboard/daily-pv-chart";
import { RevenueHistoryList } from "@/components/dashboard/revenue-history-list";
import { TrafficSourcesCard } from "@/components/dashboard/traffic-sources-card";
import { BusinessHealthCard } from "@/components/dashboard/business-health-card";
import { BusinessTrendChart } from "@/components/dashboard/business-trend-chart";
import { computePvPeriods } from "@/lib/pv";
import type { MetricsDailyRow, PvDailyRow, PvHistoryRow, RevenueHistoryRow, Site } from "@/types/site";

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 日次グラフで最大90日まで遡れるようにする
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const sinceDate = since.toISOString().slice(0, 10);

  const [
    { data: site, error },
    { data: revenueHistory },
    { data: pvHistory },
    { data: pvDaily },
    { data: metricsDaily },
  ] = await Promise.all([
    supabase.from("sites").select("*").eq("id", id).single(),
    supabase.from("revenue_history").select("*").eq("site_id", id).order("year_month", { ascending: true }),
    supabase.from("pv_history").select("*").eq("site_id", id).order("year_month", { ascending: true }),
    supabase.from("pv_daily").select("*").eq("site_id", id).gte("date", sinceDate).order("date", { ascending: true }),
    // metrics_daily のテーブルが無い(SQL未実行)ときは data が null になり、グラフは出ない
    supabase.from("metrics_daily").select("*").eq("site_id", id).gte("date", sinceDate).order("date", { ascending: true }),
  ]);

  if (error || !site) {
    notFound();
  }

  const siteRow = site as Site;
  const revenueList = (revenueHistory ?? []) as RevenueHistoryRow[];
  const pvHistoryList = (pvHistory ?? []) as PvHistoryRow[];
  const pvDailyList = (pvDaily ?? []) as PvDailyRow[];
  const metricsList = (metricsDaily ?? []) as MetricsDailyRow[];
  const pvPeriods = computePvPeriods([siteRow], pvDailyList, pvHistoryList);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6">
      <SiteDetailView site={siteRow} pvPeriods={pvPeriods[siteRow.id]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BusinessHealthCard site={siteRow} />
        <BusinessTrendChart rows={metricsList} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyTrendChart
          sites={[siteRow]}
          revenueHistory={revenueList}
          pvHistory={pvHistoryList}
          fixedSiteId={siteRow.id}
        />
        <DailyPvChart sites={[siteRow]} pvDaily={pvDailyList} fixedSiteId={siteRow.id} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueHistoryList revenueHistory={revenueList} />
        {siteRow.traffic_sources && <TrafficSourcesCard sources={siteRow.traffic_sources} />}
      </div>
    </div>
  );
}
