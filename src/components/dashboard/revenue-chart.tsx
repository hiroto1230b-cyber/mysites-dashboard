"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RevenueHistoryRow, Site } from "@/types/site";

interface RevenueChartProps {
  sites: Site[];
  revenueHistory: RevenueHistoryRow[];
}

const ALL_SITES = "__all__";

function formatMonthLabel(yearMonth: string) {
  const d = new Date(yearMonth);
  return `${d.getFullYear()}/${d.getMonth() + 1}`;
}

export function RevenueChart({ sites, revenueHistory }: RevenueChartProps) {
  const [selected, setSelected] = useState<string>(ALL_SITES);

  const chartData = useMemo(() => {
    const monthMap = new Map<string, Map<string, number>>();

    for (const row of revenueHistory) {
      const monthKey = row.year_month.slice(0, 7);
      if (!monthMap.has(monthKey)) monthMap.set(monthKey, new Map());
      monthMap.get(monthKey)!.set(row.site_id, row.revenue);
    }

    const months = Array.from(monthMap.keys()).sort();

    return months.map((month) => {
      const bySite = monthMap.get(month)!;
      if (selected === ALL_SITES) {
        const total = Array.from(bySite.values()).reduce((sum, v) => sum + v, 0);
        return { month: formatMonthLabel(month), revenue: total };
      }
      return { month: formatMonthLabel(month), revenue: bySite.get(selected) ?? 0 };
    });
  }, [revenueHistory, selected]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">月次収益推移</CardTitle>
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
            まだ収益データがありません。サイトの「収益を記録」から登録してください。
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8e8e93" }} axisLine={{ stroke: "#e5e5ea" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#8e8e93" }} axisLine={false} tickLine={false} width={60} />
              <Tooltip
                formatter={(value) => [`¥${new Intl.NumberFormat("ja-JP").format(Number(value))}`, "収益"]}
                contentStyle={{ borderRadius: 12, borderColor: "#e5e5ea", fontSize: 12 }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#007aff" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
