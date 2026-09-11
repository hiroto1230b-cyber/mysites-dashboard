"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SyncResult } from "@/lib/sync/syncSite";

interface SyncButtonProps {
  siteId?: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  disabled?: boolean;
  disabledReason?: string;
}

export function SyncButton({
  siteId,
  label = "同期",
  variant = "outline",
  size = "sm",
  disabled = false,
  disabledReason,
}: SyncButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      const res = await fetch("/api/sync-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteId ? { siteId } : {}),
      });

      // セッション切れを「同期の失敗」と混同させない。
      // 原因が違えば、やることも違う(再ログインが必要)
      if (res.status === 401) {
        toast.error("ログインの有効期限が切れています。ログインし直してください");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        toast.error("同期に失敗しました");
        return;
      }

      const { results }: { results: SyncResult[] } = await res.json();
      const failed = results.filter((r) => !r.ok);

      if (results.length === 0) {
        toast.info("同期対象のサイトがありません");
      } else if (failed.length === 0) {
        toast.success(`${results.length}件のサイトを同期しました`);
      } else {
        toast.warning(`${results.length - failed.length}件成功、${failed.length}件失敗しました`);
      }

      router.refresh();
    } catch {
      toast.error("同期中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={loading || disabled}
      title={disabled ? disabledReason : undefined}
    >
      <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
      {size !== "icon" && (loading ? "同期中..." : label)}
    </Button>
  );
}
