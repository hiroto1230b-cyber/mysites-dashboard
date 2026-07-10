export type SiteStatus = "active" | "inactive" | "error";

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
