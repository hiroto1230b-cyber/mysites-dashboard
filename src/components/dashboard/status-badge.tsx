import { Badge } from "@/components/ui/badge";
import type { SiteStatus } from "@/types/site";

const STATUS_CONFIG: Record<SiteStatus, { label: string; className: string }> = {
  active: { label: "稼働中", className: "bg-blue-50 text-blue-700 border-blue-200" },
  inactive: { label: "停止中", className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
  error: { label: "同期失敗", className: "bg-red-50 text-red-700 border-red-200" },
};

export function StatusBadge({ status }: { status: SiteStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
