import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { goalProgress, profitSummary } from "@/lib/business";
import type { Site } from "@/types/site";

const yen = (n: number) => `¥${new Intl.NumberFormat("ja-JP").format(n)}`;

function ProgressBar({ ratio }: { ratio: number }) {
  const pct = Math.min(Math.max(ratio, 0), 1) * 100;
  const color = ratio >= 1 ? "bg-green-500" : ratio >= 0.5 ? "bg-primary" : "bg-orange-400";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function BusinessHealthCard({ site }: { site: Site }) {
  const profit = profitSummary(site);
  const goals = goalProgress(site);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">損益と目標</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <section className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">今月の損益</p>
          {profit === null ? (
            <p className="text-sm text-muted-foreground">
              月額コストが未設定です。メニューの「経営設定」から入力すると、損益と黒字化までの距離が出ます。
            </p>
          ) : (
            <>
              <div className="flex items-baseline gap-3">
                <span
                  className={`text-2xl font-semibold tracking-tight ${
                    profit.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {profit.profit >= 0 ? "+" : "−"}
                  {yen(Math.abs(profit.profit))}
                </span>
                <span className="text-xs text-muted-foreground">
                  {profit.revenueLabel} {yen(profit.revenue)} − コスト {yen(profit.cost)}
                </span>
              </div>
              {profit.shortfall === 0 ? (
                <p className="text-sm text-green-700">黒字です。</p>
              ) : profit.contractsNeeded !== null ? (
                <p className="text-sm text-foreground">
                  黒字まで <span className="font-semibold">あと{profit.contractsNeeded}契約</span>
                  <span className="text-muted-foreground">(不足 {yen(profit.shortfall)})</span>
                </p>
              ) : (
                <p className="text-sm text-foreground">
                  黒字まで <span className="font-semibold">あと{yen(profit.shortfall)}</span>
                  <span className="text-muted-foreground">(月額単価を設定すると契約数で出ます)</span>
                </p>
              )}
            </>
          )}
        </section>

        <section className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">月の目標</p>
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">目標が未設定です。「経営設定」から入力できます。</p>
          ) : (
            goals.map((goal) => (
              <div key={goal.label} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">{goal.label}</span>
                  <span className="text-foreground">
                    {goal.current === null ? (
                      <span className="text-muted-foreground">未計測</span>
                    ) : (
                      <>
                        <span className="font-semibold">{goal.format(goal.current)}</span>
                        <span className="text-muted-foreground"> / {goal.format(goal.target)}</span>
                        {goal.target > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {Math.round((goal.current / goal.target) * 100)}%
                          </span>
                        )}
                      </>
                    )}
                  </span>
                </div>
                {goal.current !== null && goal.target > 0 && <ProgressBar ratio={goal.current / goal.target} />}
              </div>
            ))
          )}
        </section>
      </CardContent>
    </Card>
  );
}
