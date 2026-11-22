import type { Pillar, Site } from "@/types/site";

export const PILLAR_LABEL: Record<Pillar, string> = {
  "1": "柱① 本業",
  "2": "柱② 広告",
  "3": "柱③ サブスク",
};

export const PILLAR_ORDER: (Pillar | null)[] = ["1", "2", "3", null];

/** 列がまだ無い(マイグレーション前)と undefined になるため、数値以外はすべて未設定(null)扱いにする */
export function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * 損益の計算に使う「月の収益」。
 * サブスクのサイトは MRR(毎月入ってくる見込み)の方が実態に近いので優先する。
 * MRR を報告していないサイトは、今月記録された収益を使う。
 */
export function monthlyRevenueBasis(site: Site): { amount: number; label: string } {
  const mrr = num(site.mrr);
  if (mrr !== null) return { amount: mrr, label: "MRR" };
  return { amount: site.revenue, label: "今月の収益" };
}

export interface ProfitSummary {
  cost: number;
  revenue: number;
  revenueLabel: string;
  profit: number;
  /** 黒字までに足りない額。黒字なら 0 */
  shortfall: number;
  /** 黒字までにあと何契約必要か。単価が未設定なら null */
  contractsNeeded: number | null;
}

/** 月額コストが未設定なら損益は出せないので null */
export function profitSummary(site: Site): ProfitSummary | null {
  const cost = num(site.monthly_cost);
  if (cost === null) return null;

  const { amount: revenue, label: revenueLabel } = monthlyRevenueBasis(site);
  const profit = revenue - cost;
  const shortfall = Math.max(cost - revenue, 0);
  const unitPrice = num(site.unit_price);

  return {
    cost,
    revenue,
    revenueLabel,
    profit,
    shortfall,
    contractsNeeded: unitPrice !== null && unitPrice > 0 ? Math.ceil(shortfall / unitPrice) : null,
  };
}

export interface GoalProgress {
  label: string;
  current: number | null;
  target: number;
  format: (n: number) => string;
}

const yen = (n: number) => `¥${new Intl.NumberFormat("ja-JP").format(n)}`;
const count = (unit: string) => (n: number) => `${new Intl.NumberFormat("ja-JP").format(n)}${unit}`;

/** 目標が設定されている項目だけを返す。今の値が計測できていない項目は current = null */
export function goalProgress(site: Site): GoalProgress[] {
  const goals: GoalProgress[] = [];

  const targetPv = num(site.target_pv);
  if (targetPv !== null) goals.push({ label: "PV(30日)", current: site.pv, target: targetPv, format: count("") });

  const targetRevenue = num(site.target_revenue);
  if (targetRevenue !== null) {
    goals.push({ label: "今月の収益", current: site.revenue, target: targetRevenue, format: yen });
  }

  const targetPaid = num(site.target_paid_subscribers);
  if (targetPaid !== null) {
    goals.push({ label: "有料会員", current: num(site.paid_subscribers), target: targetPaid, format: count("人") });
  }

  return goals;
}
