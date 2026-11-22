"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const noopSubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // テーマはブラウザでしか分からないので、サーバー描画(false)と食い違わないようクライアントでだけ描く
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  if (!mounted) return <span className="size-8" aria-hidden />;

  const isDark = resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      title={isDark ? "ライトモードにする" : "ダークモードにする"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
