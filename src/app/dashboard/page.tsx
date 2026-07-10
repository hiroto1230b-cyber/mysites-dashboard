import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiSummary } from "@/components/dashboard/kpi-summary";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { SiteCard } from "@/components/dashboard/site-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import type { RevenueHistoryRow, Site } from "@/types/site";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: sites }, { data: revenueHistory }] = await Promise.all([
    supabase.from("sites").select("*").order("created_at", { ascending: true }),
    supabase.from("revenue_history").select("*").order("year_month", { ascending: true }),
  ]);

  const siteList = (sites ?? []) as Site[];
  const revenueList = (revenueHistory ?? []) as RevenueHistoryRow[];

  const totalPv = siteList.reduce((sum, s) => sum + s.pv, 0);
  const totalPvToday = siteList.reduce((sum, s) => sum + s.pv_today, 0);
  const totalRevenue = siteList.reduce((sum, s) => sum + s.revenue, 0);
  const activeSiteCount = siteList.filter((s) => s.status === "active").length;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-6 py-8">
      <DashboardHeader />

      <KpiSummary
        totalPv={totalPv}
        totalPvToday={totalPvToday}
        totalRevenue={totalRevenue}
        activeSiteCount={activeSiteCount}
      />

      <RevenueChart sites={siteList} revenueHistory={revenueList} />

      <div>
        <h2 className="mb-3 text-sm font-medium text-zinc-500">サイト一覧</h2>
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
  );
}
