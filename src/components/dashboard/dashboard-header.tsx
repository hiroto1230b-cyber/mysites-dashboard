"use client";

import { useState } from "react";
import { Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SyncButton } from "@/components/dashboard/sync-button";
import { SiteFormDialog } from "@/components/dashboard/site-form-dialog";
import { signOut } from "@/app/auth/actions";

export function DashboardHeader() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="sticky top-0 z-10 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">MySites Dashboard</h1>
        <div className="flex items-center gap-2">
          <SyncButton label="全体を同期" />
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            サイト追加
          </Button>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="icon" title="ログアウト">
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </div>

      <SiteFormDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
