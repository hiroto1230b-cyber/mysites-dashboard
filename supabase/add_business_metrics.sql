-- サイトごとの事業指標。サイト側の /api/stats が返したときだけ入る。
-- null = そのサイトは報告していない(0 と区別するため default を置かない)。
alter table public.sites
  add column unique_visitors numeric,   -- 直近30日のユニーク訪問者数
  add column paid_subscribers numeric,  -- 有料会員数(支払い確認待ちを含む)
  add column trialing numeric,          -- 無料トライアル中の会員数
  add column mrr numeric,               -- 月次経常収益(円)
  add column new_signups_7d numeric;    -- 直近7日の新規登録数
