import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MobileNav, SidebarNav } from "@/components/dashboard/sidebar-nav";
import type { Site } from "@/types/site";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // pillar 列は後から追加したので、列名を指定せず * で取る(SQL未実行でもナビが空にならないように)
  const { data } = await supabase.from("sites").select("*").order("created_at", { ascending: true });

  // ナビはクライアントに渡るので、認証キー等を含めず必要な項目だけに絞る
  const sites = ((data ?? []) as Site[]).map(({ id, name, status, pillar }) => ({
    id,
    name,
    status,
    pillar: pillar ?? null,
  }));

  return (
    <div className="flex-1">
      <DashboardHeader />
      <MobileNav sites={sites} />

      <div className="mx-auto flex w-full max-w-6xl items-start">
        <SidebarNav sites={sites} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
