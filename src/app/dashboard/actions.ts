"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface SiteFormInput {
  name: string;
  url: string;
  custom_api_url: string;
  api_secret_key: string;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("認証が必要です");
  return { supabase, user };
}

export async function createSite(input: SiteFormInput) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("sites").insert({
    user_id: user.id,
    name: input.name,
    url: input.url,
    custom_api_url: input.custom_api_url,
    api_secret_key: input.api_secret_key,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function updateSite(siteId: string, input: SiteFormInput) {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("sites")
    .update({
      name: input.name,
      url: input.url,
      custom_api_url: input.custom_api_url,
      api_secret_key: input.api_secret_key,
    })
    .eq("id", siteId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function deleteSite(siteId: string) {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("sites").delete().eq("id", siteId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function setSiteActive(siteId: string, active: boolean) {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("sites")
    .update({ status: active ? "active" : "inactive" })
    .eq("id", siteId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function upsertMonthlyRevenue(siteId: string, yearMonth: string, revenue: number) {
  const { supabase, user } = await requireUser();

  const { error: historyError } = await supabase
    .from("revenue_history")
    .upsert(
      { site_id: siteId, user_id: user.id, year_month: yearMonth, revenue },
      { onConflict: "site_id,year_month" }
    );

  if (historyError) throw new Error(historyError.message);

  const currentMonth = new Date().toISOString().slice(0, 7);
  if (yearMonth.startsWith(currentMonth)) {
    const { error: siteError } = await supabase
      .from("sites")
      .update({ revenue })
      .eq("id", siteId);
    if (siteError) throw new Error(siteError.message);
  }

  revalidatePath("/dashboard");
}
