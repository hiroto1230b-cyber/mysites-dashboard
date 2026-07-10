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
import { createSite, updateSite, deleteSite } from "@/app/dashboard/actions";
import type { Site } from "@/types/site";

interface SiteFormDialogProps {
  site?: Site;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiteFormDialog({ site, open, onOpenChange }: SiteFormDialogProps) {
  const router = useRouter();
  const isEdit = !!site;
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(site?.name ?? "");
  const [url, setUrl] = useState(site?.url ?? "");
  const [apiUrl, setApiUrl] = useState(site?.custom_api_url ?? "");
  const [apiKey, setApiKey] = useState(site?.api_secret_key ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const input = { name, url, custom_api_url: apiUrl, api_secret_key: apiKey };
      if (isEdit) {
        await updateSite(site.id, input);
        toast.success("サイト情報を更新しました");
      } else {
        await createSite(input);
        toast.success("サイトを追加しました");
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!site) return;
    if (!confirm(`「${site.name}」を削除しますか?この操作は取り消せません。`)) return;

    setLoading(true);
    try {
      await deleteSite(site.id);
      toast.success("サイトを削除しました");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "サイトを編集" : "サイトを追加"}</DialogTitle>
          <DialogDescription>
            サイトのPV取得APIのURLと認証キーを登録してください。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">サイト名</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">サイトURL</Label>
            <Input
              id="url"
              type="url"
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiUrl">PV取得APIのURL</Label>
            <Input
              id="apiUrl"
              type="url"
              required
              placeholder="https://example.com/api/stats"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">認証キー(Bearerトークン)</Label>
            <Input
              id="apiKey"
              type="password"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter className="gap-2 sm:justify-between">
            {isEdit ? (
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleDelete}
                disabled={loading}
              >
                削除
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : isEdit ? "更新する" : "追加する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
