"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PvDailyRow, Site } from "@/types/site";

interface DailyPvChartProps {
  sites: Site[];
  pvDaily: PvDailyRow[];
}

const ALL_SITES = "__all__";

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function DailyPvChart({ sites, pvDaily }: DailyPvChartProps) {
  const [selected, setSelected] = useState<string>(ALL_SITES);

  const chartData = useMemo(() => {
    const byDate = new Map<string, Map<string, number>>();

    for (const row of pvDaily) {
      if (!byDate.has(row.date)) byDate.set(row.date, new Map());
      byDate.get(row.date)!.set(row.site_id, row.pv_today);
    }

    const dates = Array.from(byDate.keys()).sort();

    return dates.map((date) => {
      const bySite = byDate.get(date)!;
      const pv =
        selected === ALL_SITES
          ? Array.from(bySite.values()).reduce((sum, v) => sum + v, 0)
          : bySite.get(selected) ?? 0;
      return { date: formatDayLabel(date), pv };
    });
  }, [pvDaily, selected]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">日次PV推移</CardTitle>
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
            まだ日次データがありません。「同期」を行うと本日分から記録されます。
          </p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#8e8e93" }}
                  axisLine={{ stroke: "#e5e5ea" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12, fill: "#8e8e93" }} axisLine={false} tickLine={false} width={50} />
                <Tooltip
                  formatter={(value) => [new Intl.NumberFormat("ja-JP").format(Number(value)), "PV"]}
                  contentStyle={{ borderRadius: 12, borderColor: "#e5e5ea", fontSize: 12 }}
                />
                <Line type="monotone" dataKey="pv" stroke="#34c759" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-muted-foreground">
              同期を始めた日からのデータのみ表示されます。日が浅いサイトは表示期間が短くなります。
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
