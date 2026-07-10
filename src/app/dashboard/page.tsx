import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiSummary } from "@/components/dashboard/kpi-summary";
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart";
import { SiteComparisonChart } from "@/components/dashboard/site-comparison-chart";
import { SiteCard } from "@/components/dashboard/site-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import type { PvHistoryRow, RevenueHistoryRow, Site } from "@/types/site";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: sites }, { data: revenueHistory }, { data: pvHistory }] = await Promise.all([
    supabase.from("sites").select("*").order("created_at", { ascending: true }),
    supabase.from("revenue_history").select("*").order("year_month", { ascending: true }),
    supabase.from("pv_history").select("*").order("year_month", { ascending: true }),
  ]);

  const siteList = (sites ?? []) as Site[];
  const revenueList = (revenueHistory ?? []) as RevenueHistoryRow[];
  const pvHistoryList = (pvHistory ?? []) as PvHistoryRow[];

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
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MonthlyTrendChart sites={siteList} revenueHistory={revenueList} pvHistory={pvHistoryList} />
          <SiteComparisonChart sites={siteList} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">サイト一覧</h2>
          {siteList.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {siteList.map((site) => (
                <SiteCard key={site.id} site={site} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
