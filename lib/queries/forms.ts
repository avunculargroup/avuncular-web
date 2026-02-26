import { createClient } from "@/lib/supabase/server";

export async function getFormBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) throw error;
  return data;
}

export async function getForms() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getFormSubmissions(formId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*")
    .eq("form_id", formId)
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
