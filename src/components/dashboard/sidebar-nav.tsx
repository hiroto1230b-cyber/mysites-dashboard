"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PILLAR_LABEL, PILLAR_ORDER } from "@/lib/business";
import type { Site } from "@/types/site";

type NavSite = Pick<Site, "id" | "name" | "status" | "pillar">;

interface SidebarNavProps {
  sites: NavSite[];
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
        active ? "bg-accent font-medium text-accent-foreground" : "text-foreground/80 hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  );
}

/** 柱が1つも設定されていなければ、これまで通り「サイト」1グループにまとめる */
function groupSites(sites: NavSite[]) {
  if (!sites.some((s) => s.pillar)) return [{ title: "サイト", sites }];
  return PILLAR_ORDER.map((pillar) => ({
    title: pillar ? PILLAR_LABEL[pillar] : "未分類",
    sites: sites.filter((s) => (s.pillar ?? null) === pillar),
  })).filter((g) => g.sites.length > 0);
}

export function SidebarNav({ sites }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 space-y-4 overflow-y-auto px-3 py-6 md:block">
      <NavLink href="/dashboard" active={pathname === "/dashboard"}>
        <span className="flex items-center gap-2">
          <LayoutGrid className="size-4" />
          ホーム
        </span>
      </NavLink>

      {groupSites(sites).map((group) => (
        <div key={group.title} className="space-y-1">
          <p className="px-3 text-xs font-medium text-muted-foreground">{group.title}</p>
          {group.sites.map((site) => {
            const href = `/dashboard/sites/${site.id}`;
            return (
              <NavLink key={site.id} href={href} active={pathname === href}>
                <span className="truncate">{site.name}</span>
                {site.status !== "active" && (
                  <span className="shrink-0">
                    <StatusBadge status={site.status} />
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/** スマホ幅ではサイドバーを隠し、ヘッダー下に横スクロールのナビを出す */
export function MobileNav({ sites }: SidebarNavProps) {
  const pathname = usePathname();

  const pill = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
          active ? "bg-accent font-medium text-accent-foreground" : "bg-muted/60 text-foreground/80"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-border/60 px-4 py-2 md:hidden">
      {pill("/dashboard", "ホーム")}
      {sites.map((site) => pill(`/dashboard/sites/${site.id}`, site.name))}
    </nav>
  );
}
