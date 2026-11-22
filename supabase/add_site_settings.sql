-- サイトごとの経営設定。すべて手入力で、未入力(null)のときは画面に「未設定」と出す。
alter table public.sites
  add column pillar text check (pillar in ('1', '2', '3')),  -- 事業の柱(①本業 ②広告 ③個人向けサブスク)
  add column monthly_cost numeric,                          -- 月額の固定費(円)。サーバー・ドメイン等
  add column unit_price numeric,                            -- 1契約あたりの月額単価(円)。「あと何件で黒字か」の計算用
  add column target_pv numeric,                             -- 月の目標PV(直近30日)
  add column target_revenue numeric,                        -- 月の目標収益(円)
  add column target_paid_subscribers numeric;               -- 目標の有料会員数
