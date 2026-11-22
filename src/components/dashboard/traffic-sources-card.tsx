import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrafficSource } from "@/types/site";

function formatNumber(n: number) {
  return new Intl.NumberFormat("ja-JP").format(n);
}

/** 訪問者がこれ未満の流入元は、登録率がたまたま高く/低く出やすいので率を出さない */
const MIN_VISITORS_FOR_RATE = 5;

export function TrafficSourcesCard({ sources }: { sources: TrafficSource[] }) {
  const rows = [...sources].sort((a, b) => b.visitors - a.visitors);
  const totalVisitors = rows.reduce((sum, r) => sum + r.visitors, 0);
  const totalSignups = rows.reduce((sum, r) => sum + r.signups, 0);
  const maxVisitors = Math.max(...rows.map((r) => r.visitors), 1);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">流入元(直近7日)</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">直近7日の流入がありません。</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => {
              const showRate = row.visitors >= MIN_VISITORS_FOR_RATE;
              const rate = showRate ? Math.round((row.signups / row.visitors) * 100) : null;
              return (
                <li key={row.source} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="min-w-0 flex-1 truncate text-foreground/80">{row.source}</span>
                    <span className="shrink-0">
                      <span className="font-medium">{formatNumber(row.visitors)}人</span>
                      {row.signups > 0 && (
                        <span className="ml-2 text-xs text-green-600">
                          登録 {formatNumber(row.signups)}
                          {rate !== null && `(${rate}%)`}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${(row.visitors / maxVisitors) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
      {totalVisitors > 0 && (
        <p className="px-6 pb-4 text-xs text-muted-foreground">
          合計 {formatNumber(totalVisitors)}人 → 登録 {formatNumber(totalSignups)}人
          {totalVisitors >= MIN_VISITORS_FOR_RATE && `(登録率 ${Math.round((totalSignups / totalVisitors) * 100)}%)`}
          。訪問者{MIN_VISITORS_FOR_RATE}人未満の流入元は登録率を出していません
        </p>
      )}
    </Card>
  );
}
