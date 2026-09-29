export type SiteStatus = "active" | "inactive" | "error";

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
  revenue: number;
  unique_visitors: number | null;
  paid_subscribers: number | null;
  trialing: number | null;
  mrr: number | null;
  new_signups_7d: number | null;
  traffic_sources: TrafficSource[] | null;
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

export interface PvDailyRow {
  id: string;
  site_id: string;
  user_id: string;
  date: string;
  pv_today: number;
  created_at: string;
}
