import { num } from "@/lib/business";
import { changeRate, type SitePvPeriods } from "@/lib/pv";
import type { Site } from "@/types/site";

export type AlertLevel = "danger" | "warning" | "info" | "good";

export interface DashboardAlert {
  siteId: string;
  siteName: string;
  level: AlertLevel;
  message: string;
}

/** Cron は1日1回なので、それより十分長く更新が無いときだけ「古い」とみなす */
const STALE_HOURS = 36;
/** 前週の母数が小さいと数件の差で ±50% になるので、この件数未満は増減を判定しない */
const MIN_PV_FOR_CHANGE = 10;
const DROP_RATE = -30;
const SPIKE_RATE = 50;

const LEVEL_ORDER: Record<AlertLevel, number> = { danger: 0, warning: 1, info: 2, good: 3 };

/**
 * ダッシュボードを開いたときに「まず見るべきこと」を、データから機械的に拾う。
 * 判定はすべて計測済みの値だけで行い、値が無い項目からは何も言わない。
 */
export function buildAlerts(sites: Site[], pvPeriods: Record<string, SitePvPeriods>, now = new Date()): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  for (const site of sites) {
    if (site.status === "inactive") continue;
    const push = (level: AlertLevel, message: string) =>
      alerts.push({ siteId: site.id, siteName: site.name, level, message });

    if (site.status === "error") {
      push("danger", `同期に失敗しています${site.last_sync_error ? `(${site.last_sync_error})` : ""}`);
    } else if (site.last_synced_at) {
      const hours = (now.getTime() - new Date(site.last_synced_at).getTime()) / 36e5;
      if (hours >= STALE_HOURS) push("warning", `${Math.floor(hours)}時間データが更新されていません`);
    } else {
      push("warning", "まだ一度も同期していません");
    }

    const weekly = pvPeriods[site.id]?.weekly;
    if (weekly && weekly.previous !== null && weekly.previous >= MIN_PV_FOR_CHANGE) {
      const rate = changeRate(weekly);
      if (rate !== null && rate <= DROP_RATE) {
        push("warning", `PVが前週比 ${rate}%(${weekly.previous} → ${weekly.current})`);
      } else if (rate !== null && rate >= SPIKE_RATE) {
        push("good", `PVが前週比 +${rate}%(${weekly.previous} → ${weekly.current})。伸びた理由を確認する価値あり`);
      }
    }

    const trialing = num(site.trialing);
    if (trialing !== null && trialing > 0) {
      push("info", `トライアル中が${trialing}人。有料化の分かれ目です`);
    }

    const cost = num(site.monthly_cost);
    if (cost === null) {
      push("info", "月額コストが未設定のため、損益が出せません");
    }
  }

  return alerts.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
}
