"use client";

import { useState } from "react";
import { Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SyncButton } from "@/components/dashboard/sync-button";
import { SiteFormDialog } from "@/components/dashboard/site-form-dialog";
import { signOut } from "@/app/auth/actions";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="sticky top-0 z-10 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6">
        <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">MySites Dashboard</h1>
        <div className="flex shrink-0 items-center gap-2">
          <SyncButton label="全体を同期" compactOnMobile />
          <Button size="sm" onClick={() => setAddOpen(true)} title="サイト追加">
            <Plus className="size-4" />
            <span className="hidden sm:inline">サイト追加</span>
          </Button>
          <ThemeToggle />
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
