"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SyncButton } from "@/components/dashboard/sync-button";
import { SiteFormDialog } from "@/components/dashboard/site-form-dialog";
import { RevenueFormDialog } from "@/components/dashboard/revenue-form-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setSiteActive } from "@/app/dashboard/actions";
import { changeRate, type PvPeriod, type SitePvPeriods } from "@/lib/pv";
import type { Site } from "@/types/site";

const PV_LABEL: Record<PvPeriod, string> = {
  daily: "PV(本日)",
  weekly: "PV(直近7日)",
  monthly: "PV(30日)",
};

const COMPARED_TO: Record<PvPeriod, string> = {
  daily: "昨日比",
  weekly: "前週比",
  monthly: "先月比",
};

function ChangeBadge({ rate, comparedTo }: { rate: number | null; comparedTo: string }) {
  if (rate === null) {
    return <span className="text-[11px] text-muted-foreground">{comparedTo} データ不足</span>;
  }
  const color = rate > 0 ? "text-green-600" : rate < 0 ? "text-red-600" : "text-muted-foreground";
  const sign = rate > 0 ? "+" : "";
  return (
    <span className={`text-[11px] font-medium ${color}`}>
      {comparedTo} {sign}
      {rate}%
    </span>
  );
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("ja-JP").format(n);
}

function formatDateTime(iso: string | null) {
  if (!iso) return "未同期";
  return new Date(iso).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SiteCard({ site, pvPeriods }: { site: Site; pvPeriods: SitePvPeriods }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [revenueOpen, setRevenueOpen] = useState(false);
  const [pvPeriod, setPvPeriod] = useState<PvPeriod>("monthly");

  const period = pvPeriods[pvPeriod];

  // サイトが報告している事業指標だけを並べる(報告していない指標は出さない)
  const businessMetrics = [
    { label: "ユニーク訪問者(30日)", value: site.unique_visitors, format: (n: number) => `${formatNumber(n)}人` },
    { label: "有料会員", value: site.paid_subscribers, format: (n: number) => `${formatNumber(n)}人` },
    { label: "トライアル中", value: site.trialing, format: (n: number) => `${formatNumber(n)}人` },
    { label: "MRR", value: site.mrr, format: (n: number) => `¥${formatNumber(n)}` },
    { label: "新規登録(7日)", value: site.new_signups_7d, format: (n: number) => `${formatNumber(n)}人` },
  ].filter((m): m is { label: string; value: number; format: (n: number) => string } => typeof m.value === "number");

  async function handleToggleActive() {
    try {
      await setSiteActive(site.id, site.status === "inactive");
      toast.success(site.status === "inactive" ? "同期を再開しました" : "同期を停止しました");
      router.refresh();
    } catch {
      toast.error("操作に失敗しました");
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/sites/${site.id}`}
              className="truncate font-semibold text-foreground hover:text-primary hover:underline"
            >
              {site.name}
            </Link>
            <StatusBadge status={site.status} />
          </div>
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            {site.url}
          </a>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8 shrink-0" />}>
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>編集</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRevenueOpen(true)}>収益を記録</DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleActive}>
              {site.status === "inactive" ? "同期を再開する" : "同期を停止する"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <SiteFormDialog site={site} open={editOpen} onOpenChange={setEditOpen} />
        <RevenueFormDialog site={site} open={revenueOpen} onOpenChange={setRevenueOpen} />
      </CardHeader>

      <CardContent className="space-y-3">
        {site.last_sync_error && (
          <p className="truncate rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
            {site.last_sync_error}
          </p>
        )}

        <Tabs value={pvPeriod} onValueChange={(value) => setPvPeriod((value as PvPeriod) ?? "monthly")}>
          <TabsList className="w-full">
            <TabsTrigger value="daily" className="flex-1">日次</TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1">週次</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">月次</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{PV_LABEL[pvPeriod]}</p>
            <p className="text-lg font-semibold text-foreground">{formatNumber(period.current)}</p>
            <ChangeBadge rate={changeRate(period)} comparedTo={COMPARED_TO[pvPeriod]} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">今月の収益</p>
            <p className="text-lg font-semibold text-foreground">¥{formatNumber(site.revenue)}</p>
          </div>
        </div>

        {businessMetrics.length > 0 && (
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/60 px-3 py-2">
            {businessMetrics.map((m) => (
              <div key={m.label}>
                <p className="text-[11px] text-muted-foreground">{m.label}</p>
                <p className="text-sm font-semibold text-foreground">{m.format(m.value)}</p>
              </div>
            ))}
          </div>
        )}

        {expanded && (
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
            <div>
              <p className="text-xs text-muted-foreground">本日のPV</p>
              <p className="text-sm font-medium text-foreground/80">{formatNumber(site.pv_today)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">累計PV</p>
              <p className="text-sm font-medium text-foreground/80">{formatNumber(site.pv_total)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">最終同期</p>
              <p className="text-sm font-medium text-foreground/80">{formatDateTime(site.last_synced_at)}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <>
                閉じる <ChevronUp className="size-3" />
              </>
            ) : (
              <>
                もっと見る <ChevronDown className="size-3" />
              </>
            )}
          </Button>
          <SyncButton
            siteId={site.id}
            label="このサイトを同期"
            disabled={site.status === "inactive"}
            disabledReason="同期を停止中です。再開してから同期してください"
          />
        </div>
      </CardContent>
    </Card>
  );
}
