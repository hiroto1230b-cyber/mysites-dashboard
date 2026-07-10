-- sites: 管理対象サイトの一覧
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null,
  custom_api_url text not null,
  api_secret_key text not null,
  pv numeric not null default 0,
  pv_today numeric not null default 0,
  pv_total numeric not null default 0,
  revenue numeric not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive', 'error')),
  last_synced_at timestamptz,
  last_sync_error text,
  created_at timestamptz not null default now()
);

alter table public.sites enable row level security;

create policy "select own sites" on public.sites
  for select using (auth.uid() = user_id);
create policy "insert own sites" on public.sites
  for insert with check (auth.uid() = user_id);
create policy "update own sites" on public.sites
  for update using (auth.uid() = user_id);
create policy "delete own sites" on public.sites
  for delete using (auth.uid() = user_id);

-- revenue_history: サイトごとの月次収益(手動記録)
create table public.revenue_history (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  year_month date not null, -- 月初日で保持 (例: 2026-07-01)
  revenue numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (site_id, year_month)
);

alter table public.revenue_history enable row level security;

create policy "select own revenue_history" on public.revenue_history
  for select using (auth.uid() = user_id);
create policy "insert own revenue_history" on public.revenue_history
  for insert with check (auth.uid() = user_id);
create policy "update own revenue_history" on public.revenue_history
  for update using (auth.uid() = user_id);
create policy "delete own revenue_history" on public.revenue_history
  for delete using (auth.uid() = user_id);
