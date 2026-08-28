import type { PvDailyRow } from "@/types/site";

/**
 * 直近7日分(本日を含む)のpv_todayをサイトごとに合計する。
 * pv_dailyは同期のたびに「その日最後の値」で上書きされるため、
 * 運用開始直後は7日分揃うまで実際より少なく出る(徐々に精度が上がる)。
 */
export function computeWeeklyPvBySite(pvDaily: PvDailyRow[]): Record<string, number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const result: Record<string, number> = {};

  for (const row of pvDaily) {
    if (new Date(row.date) < sevenDaysAgo) continue;
    result[row.site_id] = (result[row.site_id] ?? 0) + row.pv_today;
  }

  return result;
}
