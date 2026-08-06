import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // cron は Vercel のスケジューラから未ログインで叩かれる。ルート側で
  // CRON_SECRET を検証しているので、ここでログインへ飛ばしてはいけない。
  // セッション確認より前に抜ける(不要な往復を省く)。
  if (request.nextUrl.pathname.startsWith("/api/cron/")) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/auth");

  // API はログイン画面へ飛ばさず、JSONで401を返す。
  //
  // リダイレクトすると fetch が自動で追従してログインページのHTMLを受け取り、
  // 呼び出し側の res.json() が失敗する。結果、セッション切れなのに
  // 「同期に失敗しました」と表示され、原因が分からなくなる。
  if (!user && request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "セッションの有効期限が切れています。ログインし直してください" },
      { status: 401 }
    );
  }

  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage && !request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
