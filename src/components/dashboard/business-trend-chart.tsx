"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MetricsDailyRow } from "@/types/site";

type MetricKey = "unique_visitors" | "paid_subscribers" | "trialing" | "mrr";

const METRICS: { key: MetricKey; label: string; color: string; format: (n: number) => string }[] = [
  { key: "mrr", label: "MRR", color: "#ff9500", format: (n) => `¥${new Intl.NumberFormat("ja-JP").format(n)}` },
  { key: "paid_subscribers", label: "有料会員", color: "#34c759", format: (n) => `${n}人` },
  { key: "trialing", label: "トライアル", color: "#af52de", format: (n) => `${n}人` },
  { key: "unique_visitors", label: "訪問者(30日)", color: "#007aff", format: (n) => `${n}人` },
];

function formatDayLabel(dateStr: string) {
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/**
 * 事業指標の日々の推移。metrics_daily は同期を始めた日からしか無いので、
 * 一度でも記録された指標だけを選択肢に出す(報告していない指標の空グラフは出さない)。
 */
export function BusinessTrendChart({ rows }: { rows: MetricsDailyRow[] }) {
  const available = useMemo(
    () => METRICS.filter((m) => rows.some((r) => typeof r[m.key] === "number")),
    [rows]
  );
  const [selected, setSelected] = useState<MetricKey | null>(null);
  const metric = available.find((m) => m.key === selected) ?? available[0];

  if (!metric) return null;

  const data = rows
    .filter((r) => typeof r[metric.key] === "number")
    .map((r) => ({ date: formatDayLabel(r.date), value: r[metric.key] as number }));

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base font-semibold">事業指標の推移</CardTitle>
        {available.length > 1 && (
          <Tabs value={metric.key} onValueChange={(v) => setSelected(v as MetricKey)}>
            <TabsList>
              {available.map((m) => (
                <TabsTrigger key={m.key} value={m.key}>
                  {m.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent>
        {data.length < 2 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            記録が{data.length}日分しかありません。毎日の同期で記録がたまると推移が見えるようになります。
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#8e8e93" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#8e8e93" }}
                axisLine={false}
                tickLine={false}
                width={56}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value) => [metric.format(Number(value)), metric.label]}
                contentStyle={{ borderRadius: 12, borderColor: "var(--border)", backgroundColor: "var(--popover)", color: "var(--popover-foreground)", fontSize: 12 }}
              />
              <Line type="monotone" dataKey="value" stroke={metric.color} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
