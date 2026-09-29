-- サイトが報告する場合のみ入る、直近7日の流入元別の訪問者数・登録数。
-- 例: [{"source": "Instagram", "visitors": 12, "signups": 2}, ...]
alter table public.sites
  add column traffic_sources jsonb;
