"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Next.js 16 では再試行の関数が reset ではなく unstable_retry になっている
export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <p className="text-base font-semibold text-foreground">画面の読み込みに失敗しました</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        通信が一時的に不安定な可能性があります。もう一度試しても直らない場合は、ログインし直してください。
      </p>
      {error.digest && <p className="text-xs text-muted-foreground">エラーID: {error.digest}</p>}
      <Button size="sm" onClick={() => unstable_retry()}>
        もう一度読み込む
      </Button>
    </div>
  );
}
