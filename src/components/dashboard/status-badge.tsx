import { Badge } from "@/components/ui/badge";
import type { SiteStatus } from "@/types/site";

const STATUS_CONFIG: Record<SiteStatus, { label: string; className: string }> = {
  active: { label: "稼働中", className: "bg-accent text-accent-foreground" },
  inactive: { label: "停止中", className: "bg-muted text-muted-foreground" },
  error: { label: "同期失敗", className: "bg-red-50 text-red-700" },
};

export function StatusBadge({ status }: { status: SiteStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`rounded-full border-transparent px-2.5 ${config.className}`}>
      {config.label}
    </Badge>
  );
}
