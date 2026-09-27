import { Card, CardContent } from "@/components/ui/card";

interface KpiSummaryProps {
  totalPv: number;
  totalPvToday: number;
  totalRevenue: number;
  activeSiteCount: number;
  // 以下はサイト側が報告しているときだけ値が入る。どのサイトも報告していなければ null
  totalUniqueVisitors: number | null;
  totalPaidSubscribers: number | null;
  totalMrr: number | null;
  totalNewSignups7d: number | null;
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("ja-JP").format(n);
}

interface KpiItem {
  label: string;
  value: string | null;
  note?: string;
}

function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="shadow-sm">
          <CardContent className="py-2">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            {item.value === null ? (
              <p className="mt-1 text-2xl font-semibold tracking-tight text-muted-foreground/60">未計測</p>
            ) : (
              <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{item.value}</p>
            )}
            {item.note && <p className="mt-0.5 text-[11px] text-muted-foreground">{item.note}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function KpiSummary(props: KpiSummaryProps) {
  const orNull = (n: number | null, format: (n: number) => string) => (n === null ? null : format(n));

  return (
    <div className="space-y-4">
      <KpiGrid
        items={[
          { label: "総PV(30日)", value: formatNumber(props.totalPv) },
          { label: "本日のPV", value: formatNumber(props.totalPvToday) },
          { label: "今月の収益合計", value: `¥${formatNumber(props.totalRevenue)}` },
          { label: "稼働中サイト数", value: `${props.activeSiteCount}件` },
        ]}
      />
      <KpiGrid
        items={[
          {
            label: "ユニーク訪問者(30日)",
            value: orNull(props.totalUniqueVisitors, (n) => `${formatNumber(n)}人`),
            note: "計測しているサイトのみの合計",
          },
          {
            label: "有料会員数",
            value: orNull(props.totalPaidSubscribers, (n) => `${formatNumber(n)}人`),
          },
          {
            label: "MRR(月次経常収益)",
            value: orNull(props.totalMrr, (n) => `¥${formatNumber(n)}`),
          },
          {
            label: "新規登録(直近7日)",
            value: orNull(props.totalNewSignups7d, (n) => `${formatNumber(n)}人`),
          },
        ]}
      />
    </div>
  );
}
