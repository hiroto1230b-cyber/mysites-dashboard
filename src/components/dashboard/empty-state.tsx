"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFormDialog } from "@/components/dashboard/site-form-dialog";

export function EmptyState() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <p className="text-sm text-muted-foreground">まだサイトが登録されていません。</p>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        最初のサイトを追加
      </Button>

      <SiteFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
