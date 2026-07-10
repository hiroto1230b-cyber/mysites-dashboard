"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { upsertMonthlyRevenue } from "@/app/dashboard/actions";
import type { Site } from "@/types/site";

interface RevenueFormDialogProps {
  site: Site;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function currentYearMonth() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

export function RevenueFormDialog({ site, open, onOpenChange }: RevenueFormDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yearMonth, setYearMonth] = useState(currentYearMonth());
  const [revenue, setRevenue] = useState(String(site.revenue ?? 0));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await upsertMonthlyRevenue(site.id, `${yearMonth}-01`, Number(revenue));
      toast.success("収益を記録しました");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{site.name}の収益を記録</DialogTitle>
          <DialogDescription>対象月の収益を手動で記録します。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="yearMonth">対象月</Label>
            <Input
              id="yearMonth"
              type="month"
              required
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="revenue">収益(円)</Label>
            <Input
              id="revenue"
              type="number"
              min={0}
              step="1"
              required
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "記録する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
