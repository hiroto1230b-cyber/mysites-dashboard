"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PvHistoryRow, RevenueHistoryRow, Site } from "@/types/site";

interface MonthlyTrendChartProps {
  sites: Site[];
  revenueHistory: RevenueHistoryRow[];
  pvHistory: PvHistoryRow[];
}

const ALL_SITES = "__all__";

function formatMonthLabel(yearMonth: string) {
  const d = new Date(yearMonth);
  return `${d.getFullYear()}/${d.getMonth() + 1}`;
}

export function MonthlyTrendChart({ sites, revenueHistory, pvHistory }: MonthlyTrendChartProps) {
  const [selected, setSelected] = useState<string>(ALL_SITES);

  const chartData = useMemo(() => {
    const pvByMonth = new Map<string, Map<string, number>>();
    const revenueByMonth = new Map<string, Map<string, number>>();

    for (const row of pvHistory) {
      const monthKey = row.year_month.slice(0, 7);
      if (!pvByMonth.has(monthKey)) pvByMonth.set(monthKey, new Map());
      pvByMonth.get(monthKey)!.set(row.site_id, row.pv);
    }
    for (const row of revenueHistory) {
      const monthKey = row.year_month.slice(0, 7);
      if (!revenueByMonth.has(monthKey)) revenueByMonth.set(monthKey, new Map());
      revenueByMonth.get(monthKey)!.set(row.site_id, row.revenue);
    }

    const months = Array.from(new Set([...pvByMonth.keys(), ...revenueByMonth.keys()])).sort();

    return months.map((month) => {
      const pvBySite = pvByMonth.get(month) ?? new Map();
      const revenueBySite = revenueByMonth.get(month) ?? new Map();

      const pv =
        selected === ALL_SITES
          ? Array.from(pvBySite.values()).reduce((sum, v) => sum + v, 0)
          : pvBySite.get(selected) ?? 0;
      const revenue =
        selected === ALL_SITES
          ? Array.from(revenueBySite.values()).reduce((sum, v) => sum + v, 0)
          : revenueBySite.get(selected) ?? 0;

      return { month: formatMonthLabel(month), pv, revenue };
    });
  }, [pvHistory, revenueHistory, selected]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">月次PV・収益推移</CardTitle>
        <Select value={selected} onValueChange={(value) => setSelected(value ?? ALL_SITES)}>
          <SelectTrigger className="w-40" size="sm">
            <SelectValue>
              {selected === ALL_SITES ? "全サイト合算" : sites.find((s) => s.id === selected)?.name ?? "全サイト合算"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SITES}>全サイト合算</SelectItem>
            {sites.map((site) => (
              <SelectItem key={site.id} value={site.id}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            まだ月次データがありません。「同期」と「収益を記録」を行うと今月分から記録されます。
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" />
              <XAxis
                dataKey="month"
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
                label={{ value: "PV", angle: -90, position: "insideLeft", fontSize: 11, fill: "#8e8e93" }}
              />
              <YAxis
                yAxisId="revenue"
                orientation="right"
                tick={{ fontSize: 12, fill: "#8e8e93" }}
                axisLine={false}
                tickLine={false}
                width={70}
                tickFormatter={(value) => `¥${new Intl.NumberFormat("ja-JP", { notation: "compact" }).format(value)}`}
                label={{ value: "収益", angle: 90, position: "insideRight", fontSize: 11, fill: "#8e8e93" }}
              />
              <Tooltip
                formatter={(value, name) =>
                  name === "revenue"
                    ? [`¥${new Intl.NumberFormat("ja-JP").format(Number(value))}`, "収益"]
                    : [new Intl.NumberFormat("ja-JP").format(Number(value)), "PV(30日)"]
                }
                contentStyle={{ borderRadius: 12, borderColor: "#e5e5ea", fontSize: 12 }}
              />
              <Legend
                formatter={(value) => (value === "revenue" ? "収益" : "PV(30日)")}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar yAxisId="pv" dataKey="pv" fill="#34c759" radius={[6, 6, 0, 0]} barSize={28} />
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#ff9500"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
