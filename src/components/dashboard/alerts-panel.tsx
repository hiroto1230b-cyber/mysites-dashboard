import Link from "next/link";
import { AlertTriangle, CircleAlert, Info, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AlertLevel, DashboardAlert } from "@/lib/alerts";

const LEVEL_STYLE: Record<AlertLevel, { icon: typeof Info; className: string }> = {
  danger: { icon: CircleAlert, className: "text-red-600" },
  warning: { icon: AlertTriangle, className: "text-orange-500" },
  info: { icon: Info, className: "text-primary" },
  good: { icon: TrendingUp, className: "text-green-600" },
};

/** 件数が多いと埋もれるので、まず上位だけを見せる */
const MAX_VISIBLE = 6;

export function AlertsPanel({ alerts }: { alerts: DashboardAlert[] }) {
  const visible = alerts.slice(0, MAX_VISIBLE);
  const hidden = alerts.length - visible.length;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          要チェック
          {alerts.length > 0 && <span className="ml-2 text-sm font-normal text-muted-foreground">{alerts.length}件</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">気になる点はありません。</p>
        ) : (
          <ul className="space-y-2">
            {visible.map((alert, i) => {
              const { icon: Icon, className } = LEVEL_STYLE[alert.level];
              return (
                <li key={`${alert.siteId}-${i}`} className="flex items-start gap-2 text-sm">
                  <Icon className={`mt-0.5 size-4 shrink-0 ${className}`} />
                  <span className="min-w-0">
                    <Link href={`/dashboard/sites/${alert.siteId}`} className="font-medium hover:text-primary hover:underline">
                      {alert.siteName}
                    </Link>
                    <span className="text-muted-foreground">: {alert.message}</span>
                  </span>
                </li>
              );
            })}
            {hidden > 0 && <li className="text-xs text-muted-foreground">ほか{hidden}件</li>}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
