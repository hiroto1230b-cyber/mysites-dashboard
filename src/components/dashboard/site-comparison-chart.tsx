"use client";

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
import type { Site } from "@/types/site";

interface SiteComparisonChartProps {
  sites: Site[];
}

export function SiteComparisonChart({ sites }: SiteComparisonChartProps) {
  const chartData = sites.map((site) => ({
    name: site.name,
    pv: site.pv,
    revenue: site.revenue,
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">サイト別 PV・収益</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            まだサイトが登録されていません。
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                label={{ value: "PV(30日)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#8e8e93" }}
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
                    ? [`¥${new Intl.NumberFormat("ja-JP").format(Number(value))}`, "今月の収益"]
                    : [new Intl.NumberFormat("ja-JP").format(Number(value)), "PV(30日)"]
                }
                contentStyle={{ borderRadius: 12, borderColor: "#e5e5ea", fontSize: 12 }}
              />
              <Legend
                formatter={(value) => (value === "revenue" ? "今月の収益" : "PV(30日)")}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar yAxisId="pv" dataKey="pv" fill="#007aff" radius={[6, 6, 0, 0]} barSize={32} />
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
