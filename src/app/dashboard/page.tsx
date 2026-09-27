import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiSummary } from "@/components/dashboard/kpi-summary";
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart";
import { DailyPvChart } from "@/components/dashboard/daily-pv-chart";
import { SiteComparisonChart } from "@/components/dashboard/site-comparison-chart";
import { SiteCard } from "@/components/dashboard/site-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { computePvPeriods } from "@/lib/pv";
import type { PvDailyRow, PvHistoryRow, RevenueHistoryRow, Site } from "@/types/site";

/** 値を報告しているサイトだけを合計する。1つも報告していなければ null(未計測) */
function sumReported(sites: Site[], pick: (s: Site) => number | null): number | null {
  const values = sites.map(pick).filter((v): v is number => typeof v === "number");
  return values.length === 0 ? null : values.reduce((sum, v) => sum + v, 0);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [{ data: sites }, { data: revenueHistory }, { data: pvHistory }, { data: pvDaily }] =
    await Promise.all([
      supabase.from("sites").select("*").order("created_at", { ascending: true }),
      supabase.from("revenue_history").select("*").order("year_month", { ascending: true }),
      supabase.from("pv_history").select("*").order("year_month", { ascending: true }),
      supabase
        .from("pv_daily")
        .select("*")
        .gte("date", thirtyDaysAgo.toISOString().slice(0, 10))
        .order("date", { ascending: true }),
    ]);

  const siteList = (sites ?? []) as Site[];
  const revenueList = (revenueHistory ?? []) as RevenueHistoryRow[];
  const pvHistoryList = (pvHistory ?? []) as PvHistoryRow[];
  const pvDailyList = (pvDaily ?? []) as PvDailyRow[];
  const pvPeriods = computePvPeriods(siteList, pvDailyList, pvHistoryList);
  const weeklyPvBySite = Object.fromEntries(
    Object.entries(pvPeriods).map(([id, p]) => [id, p.weekly.current])
  );

  const totalPv = siteList.reduce((sum, s) => sum + s.pv, 0);
  const totalPvToday = siteList.reduce((sum, s) => sum + s.pv_today, 0);
  const totalRevenue = siteList.reduce((sum, s) => sum + s.revenue, 0);
  const activeSiteCount = siteList.filter((s) => s.status === "active").length;

  return (
    <div className="flex-1">
      <DashboardHeader />

      <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-6">
        <KpiSummary
          totalPv={totalPv}
          totalPvToday={totalPvToday}
          totalRevenue={totalRevenue}
          activeSiteCount={activeSiteCount}
          totalUniqueVisitors={sumReported(siteList, (s) => s.unique_visitors)}
          totalPaidSubscribers={sumReported(siteList, (s) => s.paid_subscribers)}
          totalMrr={sumReported(siteList, (s) => s.mrr)}
          totalNewSignups7d={sumReported(siteList, (s) => s.new_signups_7d)}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MonthlyTrendChart sites={siteList} revenueHistory={revenueList} pvHistory={pvHistoryList} />
          <DailyPvChart sites={siteList} pvDaily={pvDailyList} />
          <SiteComparisonChart sites={siteList} weeklyPvBySite={weeklyPvBySite} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">サイト一覧</h2>
          {siteList.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {siteList.map((site) => (
                <SiteCard key={site.id} site={site} pvPeriods={pvPeriods[site.id]} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
