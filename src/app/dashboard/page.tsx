import { createClient } from "@/lib/supabase/server";
import { KpiSummary } from "@/components/dashboard/kpi-summary";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart";
import { DailyPvChart } from "@/components/dashboard/daily-pv-chart";
import { SiteCard } from "@/components/dashboard/site-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { computePvPeriods } from "@/lib/pv";
import { buildAlerts } from "@/lib/alerts";
import { PILLAR_LABEL, PILLAR_ORDER, profitSummary } from "@/lib/business";
import type { PvDailyRow, PvHistoryRow, RevenueHistoryRow, Site } from "@/types/site";

/** 値を報告しているサイトだけを合計する。1つも報告していなければ null(未計測) */
function sumReported(sites: Site[], pick: (s: Site) => number | null): number | null {
  const values = sites.map(pick).filter((v): v is number => typeof v === "number");
  return values.length === 0 ? null : values.reduce((sum, v) => sum + v, 0);
}

/** 日次グラフで最大90日まで遡れるようにする */
const DAILY_HISTORY_DAYS = 90;

export default async function DashboardPage() {
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - DAILY_HISTORY_DAYS);

  const [{ data: sites }, { data: revenueHistory }, { data: pvHistory }, { data: pvDaily }] =
    await Promise.all([
      supabase.from("sites").select("*").order("created_at", { ascending: true }),
      supabase.from("revenue_history").select("*").order("year_month", { ascending: true }),
      supabase.from("pv_history").select("*").order("year_month", { ascending: true }),
      supabase
        .from("pv_daily")
        .select("*")
        .gte("date", since.toISOString().slice(0, 10))
        .order("date", { ascending: true }),
    ]);

  const siteList = (sites ?? []) as Site[];
  const revenueList = (revenueHistory ?? []) as RevenueHistoryRow[];
  const pvHistoryList = (pvHistory ?? []) as PvHistoryRow[];
  const pvDailyList = (pvDaily ?? []) as PvDailyRow[];
  const pvPeriods = computePvPeriods(siteList, pvDailyList, pvHistoryList);
  const alerts = buildAlerts(siteList, pvPeriods);

  const totalPv = siteList.reduce((sum, s) => sum + s.pv, 0);
  const totalPvToday = siteList.reduce((sum, s) => sum + s.pv_today, 0);
  const totalRevenue = siteList.reduce((sum, s) => sum + s.revenue, 0);

  const profits = siteList.map(profitSummary).filter((p) => p !== null);
  const totalProfit = profits.length === 0 ? null : profits.reduce((sum, p) => sum + p.profit, 0);

  // 柱が1つも設定されていなければ、今まで通り1つの一覧で出す
  const anyPillarSet = siteList.some((s) => s.pillar);
  const groups = anyPillarSet
    ? PILLAR_ORDER.map((pillar) => ({
        title: pillar ? PILLAR_LABEL[pillar] : "未分類",
        sites: siteList.filter((s) => (s.pillar ?? null) === pillar),
      })).filter((g) => g.sites.length > 0)
    : [{ title: "サイト一覧", sites: siteList }];

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6">
      <KpiSummary
        totalPv={totalPv}
        totalPvToday={totalPvToday}
        totalRevenue={totalRevenue}
        totalProfit={totalProfit}
        costConfiguredCount={profits.length}
        totalUniqueVisitors={sumReported(siteList, (s) => s.unique_visitors)}
        totalPaidSubscribers={sumReported(siteList, (s) => s.paid_subscribers)}
        totalMrr={sumReported(siteList, (s) => s.mrr)}
        totalNewSignups7d={sumReported(siteList, (s) => s.new_signups_7d)}
      />

      <AlertsPanel alerts={alerts} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyTrendChart sites={siteList} revenueHistory={revenueList} pvHistory={pvHistoryList} />
        <DailyPvChart sites={siteList} pvDaily={pvDailyList} />
      </div>

      {siteList.length === 0 ? (
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">サイト一覧</h2>
          <EmptyState />
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              {group.title}
              <span className="ml-2 text-xs">{group.sites.length}</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.sites.map((site) => (
                <SiteCard key={site.id} site={site} pvPeriods={pvPeriods[site.id]} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
