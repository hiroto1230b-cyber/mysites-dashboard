"use client";

import { useState } from "react";
import {
  Bar,
  ComposedChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RevenuePeriod, SiteRevenues } from "@/lib/revenue";
import type { Site } from "@/types/site";

interface SiteComparisonChartProps {
  sites: Site[];
  weeklyPvBySite: Record<string, number>;
  revenuesBySite: Record<string, SiteRevenues>;
}

type PvMode = "daily" | "weekly" | "monthly" | "total";

const PV_MODE_LABEL: Record<PvMode, string> = {
  daily: "日次",
  weekly: "週次",
  monthly: "月次(30日)",
  total: "累計",
};

const REVENUE_LABEL: Record<RevenuePeriod, string> = {
  thisMonth: "今月の収益",
  lastMonth: "先月の収益",
  total: "累計収益",
};

export function SiteComparisonChart({ sites, weeklyPvBySite, revenuesBySite }: SiteComparisonChartProps) {
  const [pvMode, setPvMode] = useState<PvMode>("monthly");
  // 収益は月単位でしか記録していないため、PVの期間とは別に選ぶ。
  // 既定を累計にしているのは、今月がまだ0円でも過去の収益が見えるようにするため。
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("total");

  const chartData = sites.map((site) => ({
    name: site.name,
    pv:
      pvMode === "daily"
        ? site.pv_today
        : pvMode === "weekly"
          ? weeklyPvBySite[site.id] ?? 0
          : pvMode === "total"
            ? site.pv_total
            : site.pv,
    revenue: revenuesBySite[site.id]?.[revenuePeriod] ?? 0,
  }));

  const pvLabel = PV_MODE_LABEL[pvMode];
  const revenueLabel = REVENUE_LABEL[revenuePeriod];

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">サイト別 PV・収益</CardTitle>
        <Tabs value={pvMode} onValueChange={(value) => setPvMode((value as PvMode) ?? "monthly")}>
          <TabsList>
            <TabsTrigger value="daily">日次</TabsTrigger>
            <TabsTrigger value="weekly">週次</TabsTrigger>
            <TabsTrigger value="monthly">月次</TabsTrigger>
            <TabsTrigger value="total">累計</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground">収益</span>
          <Tabs
            value={revenuePeriod}
            onValueChange={(value) => setRevenuePeriod((value as RevenuePeriod) ?? "total")}
          >
            <TabsList>
              <TabsTrigger value="thisMonth">今月</TabsTrigger>
              <TabsTrigger value="lastMonth">先月</TabsTrigger>
              <TabsTrigger value="total">累計</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            まだサイトが登録されていません。
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#8e8e93" }}
                axisLine={{ stroke: "#e5e5ea" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="pv"
                tick={{ fontSize: 12, fill: "#8e8e93" }}
                axisLine={false}
                tickLine={false}
                width={50}
                label={{ value: pvLabel, angle: -90, position: "insideLeft", fontSize: 11, fill: "#8e8e93" }}
              />
              <YAxis
                yAxisId="revenue"
                orientation="right"
                tick={{ fontSize: 12, fill: "#8e8e93" }}
                axisLine={false}
                tickLine={false}
                width={70}
                // 全サイト0円のとき軸が ¥0〜¥4 のような不自然な目盛りになるのを避ける
                domain={[0, (dataMax: number) => Math.max(dataMax, 1000)]}
                tickFormatter={(value) => `¥${new Intl.NumberFormat("ja-JP", { notation: "compact" }).format(value)}`}
                label={{ value: "収益", angle: 90, position: "insideRight", fontSize: 11, fill: "#8e8e93" }}
              />
              <Tooltip
                formatter={(value, name) =>
                  name === "revenue"
                    ? [`¥${new Intl.NumberFormat("ja-JP").format(Number(value))}`, revenueLabel]
                    : [new Intl.NumberFormat("ja-JP").format(Number(value)), pvLabel]
                }
                contentStyle={{ borderRadius: 12, borderColor: "#e5e5ea", fontSize: 12 }}
              />
              <Legend
                formatter={(value) => (value === "revenue" ? revenueLabel : pvLabel)}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar yAxisId="pv" dataKey="pv" fill="#007aff" radius={[6, 6, 0, 0]} barSize={28}>
                <LabelList
                  dataKey="pv"
                  position="top"
                  formatter={(value) => new Intl.NumberFormat("ja-JP").format(Number(value ?? 0))}
                  style={{ fontSize: 11, fill: "#3a3a3c" }}
                />
              </Bar>
              <Bar yAxisId="revenue" dataKey="revenue" fill="#ff9500" radius={[6, 6, 0, 0]} barSize={28}>
                <LabelList
                  dataKey="revenue"
                  position="top"
                  formatter={(value) => `¥${new Intl.NumberFormat("ja-JP").format(Number(value ?? 0))}`}
                  style={{ fontSize: 11, fill: "#3a3a3c" }}
                />
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
