"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      // メール確認が無効な場合、signUpの時点で即ログイン済みになる
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setDone(true);
  }

  async function handleGoogleSignup() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">新規登録</CardTitle>
          <CardDescription>MySites Dashboardのアカウントを作成します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {done ? (
            <p className="text-sm text-muted-foreground">
              確認メールを送信しました。メール内のリンクをクリックしてログインしてください。
            </p>
          ) : (
            <>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">パスワード</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "登録中..." : "登録する"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">または</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleGoogleSignup} type="button">
                Googleで登録
              </Button>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              ログイン
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
