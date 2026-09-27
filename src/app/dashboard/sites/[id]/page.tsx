import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteDetailView } from "@/components/dashboard/site-detail-view";
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart";
import { DailyPvChart } from "@/components/dashboard/daily-pv-chart";
import { RevenueHistoryList } from "@/components/dashboard/revenue-history-list";
import { computePvPeriods } from "@/lib/pv";
import type { PvDailyRow, PvHistoryRow, RevenueHistoryRow, Site } from "@/types/site";

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [{ data: site, error }, { data: revenueHistory }, { data: pvHistory }, { data: pvDaily }] =
    await Promise.all([
      supabase.from("sites").select("*").eq("id", id).single(),
      supabase.from("revenue_history").select("*").eq("site_id", id).order("year_month", { ascending: true }),
      supabase.from("pv_history").select("*").eq("site_id", id).order("year_month", { ascending: true }),
      supabase
        .from("pv_daily")
        .select("*")
        .eq("site_id", id)
        .gte("date", thirtyDaysAgo.toISOString().slice(0, 10))
        .order("date", { ascending: true }),
    ]);

  if (error || !site) {
    notFound();
  }

  const siteRow = site as Site;
  const revenueList = (revenueHistory ?? []) as RevenueHistoryRow[];
  const pvHistoryList = (pvHistory ?? []) as PvHistoryRow[];
  const pvDailyList = (pvDaily ?? []) as PvDailyRow[];
  const pvPeriods = computePvPeriods([siteRow], pvDailyList, pvHistoryList);

  return (
    <div className="space-y-6 px-6 py-6">
      <SiteDetailView site={siteRow} pvPeriods={pvPeriods[siteRow.id]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyTrendChart sites={[siteRow]} revenueHistory={revenueList} pvHistory={pvHistoryList} />
        <DailyPvChart sites={[siteRow]} pvDaily={pvDailyList} />
      </div>

      <RevenueHistoryList revenueHistory={revenueList} />
    </div>
  );
}
