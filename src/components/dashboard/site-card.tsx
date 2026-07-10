"use client";

import { useState } from "react";
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
import { setSiteActive } from "@/app/dashboard/actions";
import type { Site } from "@/types/site";

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

export function SiteCard({ site }: { site: Site }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [revenueOpen, setRevenueOpen] = useState(false);

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
    <Card className="border-zinc-200 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-zinc-900">{site.name}</h3>
            <StatusBadge status={site.status} />
          </div>
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-sm text-zinc-500 hover:text-blue-600 hover:underline"
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
            <DropdownMenuItem onSelect={handleToggleActive}>
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-zinc-500">PV(30日)</p>
            <p className="text-lg font-semibold text-zinc-900">{formatNumber(site.pv)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">今月の収益</p>
            <p className="text-lg font-semibold text-zinc-900">¥{formatNumber(site.revenue)}</p>
          </div>
        </div>

        {expanded && (
          <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 pt-3">
            <div>
              <p className="text-xs text-zinc-500">本日のPV</p>
              <p className="text-sm font-medium text-zinc-700">{formatNumber(site.pv_today)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">累計PV</p>
              <p className="text-sm font-medium text-zinc-700">{formatNumber(site.pv_total)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-zinc-500">最終同期</p>
              <p className="text-sm font-medium text-zinc-700">{formatDateTime(site.last_synced_at)}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-zinc-500 hover:bg-transparent hover:text-zinc-700"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <>
                閉じる <ChevronUp className="size-3" />
              </>
            ) : (
              <>
                詳細 <ChevronDown className="size-3" />
              </>
            )}
          </Button>
          <SyncButton siteId={site.id} label="このサイトを同期" />
        </div>
      </CardContent>
    </Card>
  );
}
