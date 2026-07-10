-- pv_history: サイトごとの月次PVスナップショット(同期成功時に自動記録)
create table public.pv_history (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  year_month date not null, -- 月初日で保持 (例: 2026-07-01)
  pv numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (site_id, year_month)
);

alter table public.pv_history enable row level security;

create policy "select own pv_history" on public.pv_history
  for select using (auth.uid() = user_id);
create policy "insert own pv_history" on public.pv_history
  for insert with check (auth.uid() = user_id);
create policy "update own pv_history" on public.pv_history
  for update using (auth.uid() = user_id);
create policy "delete own pv_history" on public.pv_history
  for delete using (auth.uid() = user_id);
