import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, status")
    .order("created_at", { ascending: true });

  return (
    <div className="flex-1">
      <DashboardHeader />

      <div className="mx-auto flex w-full max-w-6xl items-start">
        <SidebarNav sites={sites ?? []} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
