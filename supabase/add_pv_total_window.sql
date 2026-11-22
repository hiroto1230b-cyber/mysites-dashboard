-- pv_total が「何日分の合計か」。サイト側が古いアクセス記録を削除している場合に入る。
-- null = 削除していない(本当の累計)。例: ピアノだよりは90日より古い記録を消すので 90。
alter table public.sites
  add column pv_total_window_days numeric;
