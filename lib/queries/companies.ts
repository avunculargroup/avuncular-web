import { createClient } from "@/lib/supabase/server";

export async function getCompanies() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCompany(name: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("companies")
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data;
}
