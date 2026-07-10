import { Card, CardContent } from "@/components/ui/card";

interface KpiSummaryProps {
  totalPv: number;
  totalPvToday: number;
  totalRevenue: number;
  activeSiteCount: number;
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("ja-JP").format(n);
}

export function KpiSummary({ totalPv, totalPvToday, totalRevenue, activeSiteCount }: KpiSummaryProps) {
  const items = [
    { label: "総PV(30日)", value: formatNumber(totalPv) },
    { label: "本日のPV", value: formatNumber(totalPvToday) },
    { label: "今月の収益合計", value: `¥${formatNumber(totalRevenue)}` },
    { label: "稼働中サイト数", value: `${activeSiteCount}件` },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-zinc-200 shadow-sm">
          <CardContent className="py-2">
            <p className="text-xs text-zinc-500">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
