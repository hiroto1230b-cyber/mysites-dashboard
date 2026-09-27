import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RevenueHistoryRow } from "@/types/site";

function formatMonthLabel(yearMonth: string) {
  const d = new Date(yearMonth);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

function formatYen(n: number) {
  return `¥${new Intl.NumberFormat("ja-JP").format(n)}`;
}

export function RevenueHistoryList({ revenueHistory }: { revenueHistory: RevenueHistoryRow[] }) {
  const rows = [...revenueHistory].sort((a, b) => b.year_month.localeCompare(a.year_month));

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">月別の収益記録</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            まだ収益データがありません。「収益を記録」から登録してください。
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-muted-foreground">{formatMonthLabel(row.year_month)}</span>
                <span className="font-medium text-foreground">{formatYen(row.revenue)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
