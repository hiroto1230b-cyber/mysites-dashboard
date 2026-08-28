-- pv_daily: サイトごとの日次PVスナップショット(同期成功時に本日分を自動記録)
-- 週次表示はこのテーブルの直近7日分をSUMして算出する。運用開始直後は
-- 数日分しかデータが無いため、1週間分揃うまで徐々に精度が上がっていく。
create table public.pv_daily (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null, -- 同期を行った日(ローカル日付ではなくサーバー日時基準)
  pv_today numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (site_id, date)
);

alter table public.pv_daily enable row level security;

create policy "select own pv_daily" on public.pv_daily
  for select using (auth.uid() = user_id);
create policy "insert own pv_daily" on public.pv_daily
  for insert with check (auth.uid() = user_id);
create policy "update own pv_daily" on public.pv_daily
  for update using (auth.uid() = user_id);
create policy "delete own pv_daily" on public.pv_daily
  for delete using (auth.uid() = user_id);
