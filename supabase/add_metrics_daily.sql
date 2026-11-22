-- metrics_daily: サイトごとの事業指標の日次スナップショット(同期成功時に本日分を記録)。
-- sites テーブルは「今の値」しか持たないため、MRR や有料会員数の推移を見るにはこちらを使う。
-- サイトが報告していない指標は null のまま入る(0 と区別するため)。
create table public.metrics_daily (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  pv numeric,
  unique_visitors numeric,
  paid_subscribers numeric,
  trialing numeric,
  mrr numeric,
  revenue numeric,
  created_at timestamptz not null default now(),
  unique (site_id, date)
);

alter table public.metrics_daily enable row level security;

create policy "select own metrics_daily" on public.metrics_daily
  for select using (auth.uid() = user_id);
create policy "insert own metrics_daily" on public.metrics_daily
  for insert with check (auth.uid() = user_id);
create policy "update own metrics_daily" on public.metrics_daily
  for update using (auth.uid() = user_id);
create policy "delete own metrics_daily" on public.metrics_daily
  for delete using (auth.uid() = user_id);
