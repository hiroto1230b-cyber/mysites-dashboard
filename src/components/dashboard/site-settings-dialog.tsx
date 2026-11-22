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
import { updateSiteSettings } from "@/app/dashboard/actions";
import { PILLAR_LABEL, num } from "@/lib/business";
import type { Pillar, Site } from "@/types/site";

interface SiteSettingsDialogProps {
  site: Site;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const toText = (value: unknown) => {
  const n = num(value);
  return n === null ? "" : String(n);
};

/** 空欄は「未設定」(null)。0 は 0 として保存する */
const toNumber = (text: string) => (text.trim() === "" ? null : Number(text));

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={0}
        step="1"
        inputMode="numeric"
        placeholder="未設定"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SiteSettingsDialog({ site, open, onOpenChange }: SiteSettingsDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pillar, setPillar] = useState<Pillar | "">(site.pillar ?? "");
  const [monthlyCost, setMonthlyCost] = useState(toText(site.monthly_cost));
  const [unitPrice, setUnitPrice] = useState(toText(site.unit_price));
  const [targetPv, setTargetPv] = useState(toText(site.target_pv));
  const [targetRevenue, setTargetRevenue] = useState(toText(site.target_revenue));
  const [targetPaid, setTargetPaid] = useState(toText(site.target_paid_subscribers));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await updateSiteSettings(site.id, {
        pillar: pillar === "" ? null : pillar,
        monthly_cost: toNumber(monthlyCost),
        unit_price: toNumber(unitPrice),
        target_pv: toNumber(targetPv),
        target_revenue: toNumber(targetRevenue),
        target_paid_subscribers: toNumber(targetPaid),
      });
      toast.success("経営設定を保存しました");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{site.name} の経営設定</DialogTitle>
          <DialogDescription>空欄は「未設定」として扱います。推測の値は入れないでください。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="pillar">事業の柱</Label>
            <select
              id="pillar"
              value={pillar}
              onChange={(e) => setPillar(e.target.value as Pillar | "")}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">未分類</option>
              {(Object.keys(PILLAR_LABEL) as Pillar[]).map((p) => (
                <option key={p} value={p}>
                  {PILLAR_LABEL[p]}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium text-muted-foreground">損益</legend>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                id="monthlyCost"
                label="月額コスト(円)"
                hint="サーバー・ドメイン等の固定費"
                value={monthlyCost}
                onChange={setMonthlyCost}
              />
              <NumberField
                id="unitPrice"
                label="月額単価(円)"
                hint="1契約あたり。広告型は空欄で可"
                value={unitPrice}
                onChange={setUnitPrice}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium text-muted-foreground">月の目標</legend>
            <div className="grid grid-cols-3 gap-3">
              <NumberField id="targetPv" label="PV(30日)" value={targetPv} onChange={setTargetPv} />
              <NumberField id="targetRevenue" label="収益(円)" value={targetRevenue} onChange={setTargetRevenue} />
              <NumberField id="targetPaid" label="有料会員" value={targetPaid} onChange={setTargetPaid} />
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
