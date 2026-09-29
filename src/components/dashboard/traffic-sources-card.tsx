import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrafficSource } from "@/types/site";

function formatNumber(n: number) {
  return new Intl.NumberFormat("ja-JP").format(n);
}

export function TrafficSourcesCard({ sources }: { sources: TrafficSource[] }) {
  const rows = [...sources].sort((a, b) => b.visitors - a.visitors);
  const totalVisitors = rows.reduce((sum, r) => sum + r.visitors, 0);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">流入元(直近7日)</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">直近7日の流入がありません。</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li key={row.source} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{row.source}</span>
                <span className="shrink-0 text-foreground">
                  <span className="font-medium">{formatNumber(row.visitors)}人</span>
                  {row.signups > 0 && (
                    <span className="ml-2 text-xs text-green-600">登録 {formatNumber(row.signups)}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {totalVisitors > 0 && (
        <p className="px-6 pb-4 text-xs text-muted-foreground">
          直近7日の訪問者 合計{formatNumber(totalVisitors)}人(流入元が分かった分のみ)
        </p>
      )}
    </Card>
  );
}
