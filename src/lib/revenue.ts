import type { RevenueHistoryRow, Site } from "@/types/site";

export type RevenuePeriod = "thisMonth" | "lastMonth" | "total";

export type SiteRevenues = Record<RevenuePeriod, number>;

// revenue_history.year_month は「月初日 (YYYY-MM-01)」。先頭7文字(YYYY-MM)で月を比べる。
function monthKey(offsetMonths: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offsetMonths);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * サイトごとの収益を「今月 / 先月 / 累計」で出す。
 *
 * 収益は月単位でしか記録していないので、「30日」のような日数ローリングは出せない。
 * 今月は同期で更新される sites.revenue を使い、先月と累計は revenue_history から集計する。
 * 累計は、今月分がまだ履歴に無い場合だけ sites.revenue を足す(二重に数えない)。
 */
export function computeRevenuesBySite(
  sites: Site[],
  revenueHistory: RevenueHistoryRow[]
): Record<string, SiteRevenues> {
  const thisMonth = monthKey(0);
  const lastMonth = monthKey(-1);

  const result: Record<string, SiteRevenues> = {};

  for (const site of sites) {
    const rows = revenueHistory.filter((r) => r.site_id === site.id);
    const hasThisMonthRow = rows.some((r) => r.year_month.slice(0, 7) === thisMonth);

    const lastMonthRow = rows.find((r) => r.year_month.slice(0, 7) === lastMonth);
    const historyTotal = rows.reduce((sum, r) => sum + r.revenue, 0);

    result[site.id] = {
      thisMonth: site.revenue,
      lastMonth: lastMonthRow ? lastMonthRow.revenue : 0,
      total: historyTotal + (hasThisMonthRow ? 0 : site.revenue),
    };
  }

  return result;
}
