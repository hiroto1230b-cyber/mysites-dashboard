"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { Site } from "@/types/site";

interface SidebarNavProps {
  sites: Pick<Site, "id" | "name" | "status">[];
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-foreground/80 hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  );
}

export function SidebarNav({ sites }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 space-y-4 px-3 py-6">
      <NavLink href="/dashboard" active={pathname === "/dashboard"}>
        <span className="flex items-center gap-2">
          <LayoutGrid className="size-4" />
          ホーム
        </span>
      </NavLink>

      {sites.length > 0 && (
        <div className="space-y-1">
          <p className="px-3 text-xs font-medium text-muted-foreground">サイト</p>
          {sites.map((site) => {
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
      )}
    </nav>
  );
}
