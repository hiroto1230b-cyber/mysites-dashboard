import type { PvDailyRow, PvHistoryRow, Site } from "@/types/site";

export type PvPeriod = "daily" | "weekly" | "monthly";

/** 今の期間の値と、比較対象(前の期間)の値。前の期間のデータが無ければ previous は null */
export interface PeriodValue {
  current: number;
  previous: number | null;
}

export type SitePvPeriods = Record<PvPeriod, PeriodValue>;

// pv_daily.date は同期時のサーバー日付(YYYY-MM-DD)で入っているので、同じ形式の文字列で比較する。
// Date に変換するとタイムゾーンの解釈でずれるため。
function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysAgoKey(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return dateKey(d);
}

function monthKey(offsetMonths: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offsetMonths);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * サイトごとに 日次/週次/月次 の「今」と「前の期間」を出す。
 *
 * - 日次: 本日 vs 昨日(pv_daily)
 * - 週次: 直近7日 vs その前の7日(pv_daily の合計)
 * - 月次: 直近30日PV vs 先月の月次スナップショット(pv_history)
 *
 * pv_daily は同期を始めた日からしか無いので、運用初期は週次の「今」が少なめに出て、
 * 「前の期間」は null(比較不能)になる。
 */
export function computePvPeriods(
  sites: Site[],
  pvDaily: PvDailyRow[],
  pvHistory: PvHistoryRow[]
): Record<string, SitePvPeriods> {
  const yesterday = daysAgoKey(1);
  const thisWeekStart = daysAgoKey(6);
  const prevWeekStart = daysAgoKey(13);
  const lastMonth = monthKey(-1);

  const result: Record<string, SitePvPeriods> = {};

  for (const site of sites) {
    const rows = pvDaily.filter((r) => r.site_id === site.id);

    const yesterdayRow = rows.find((r) => r.date === yesterday);
    const thisWeekRows = rows.filter((r) => r.date >= thisWeekStart);
    const prevWeekRows = rows.filter((r) => r.date >= prevWeekStart && r.date < thisWeekStart);
    const lastMonthRow = pvHistory.find(
      (r) => r.site_id === site.id && r.year_month.slice(0, 7) === lastMonth
    );

    result[site.id] = {
      daily: { current: site.pv_today, previous: yesterdayRow ? yesterdayRow.pv_today : null },
      weekly: {
        current: thisWeekRows.reduce((sum, r) => sum + r.pv_today, 0),
        previous: prevWeekRows.length > 0 ? prevWeekRows.reduce((sum, r) => sum + r.pv_today, 0) : null,
      },
      monthly: { current: site.pv, previous: lastMonthRow ? lastMonthRow.pv : null },
    };
  }

  return result;
}

/** 前期比(%)。比較できない(前期データ無し・前期0)ときは null */
export function changeRate({ current, previous }: PeriodValue): number | null {
  if (previous === null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
