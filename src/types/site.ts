export type SiteStatus = "active" | "inactive" | "error";

/** 事業の柱。①本業(ストック収益) ②広告収益 ③個人向けサブスク */
export type Pillar = "1" | "2" | "3";

export interface TrafficSource {
  source: string;
  visitors: number;
  signups: number;
}

export interface Site {
  id: string;
  user_id: string;
  name: string;
  url: string;
  custom_api_url: string;
  api_secret_key: string;
  pv: number;
  pv_today: number;
  pv_total: number;
  /** pv_total が直近何日分か。null なら本当の累計(サイト側で古い記録を消していない) */
  pv_total_window_days: number | null;
  revenue: number;
  unique_visitors: number | null;
  paid_subscribers: number | null;
  trialing: number | null;
  mrr: number | null;
  new_signups_7d: number | null;
  traffic_sources: TrafficSource[] | null;
  // 経営設定(手入力)。未設定は null
  pillar: Pillar | null;
  monthly_cost: number | null;
  unit_price: number | null;
  target_pv: number | null;
  target_revenue: number | null;
  target_paid_subscribers: number | null;
  status: SiteStatus;
  last_synced_at: string | null;
  last_sync_error: string | null;
  created_at: string;
}

export interface RevenueHistoryRow {
  id: string;
  site_id: string;
  user_id: string;
  year_month: string;
  revenue: number;
  created_at: string;
}

export interface PvHistoryRow {
  id: string;
  site_id: string;
  user_id: string;
  year_month: string;
  pv: number;
  created_at: string;
}

export interface MetricsDailyRow {
  id: string;
  site_id: string;
  user_id: string;
  date: string;
  pv: number | null;
  unique_visitors: number | null;
  paid_subscribers: number | null;
  trialing: number | null;
  mrr: number | null;
  revenue: number | null;
  created_at: string;
}

export interface PvDailyRow {
  id: string;
  site_id: string;
  user_id: string;
  date: string;
  pv_today: number;
  created_at: string;
}
