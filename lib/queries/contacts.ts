import { createClient } from "@/lib/supabase/server";

export async function getContactsOverview(filters?: {
  stage?: string;
  owner?: string;
  literacy?: string;
}) {
  const supabase = createClient();
  let query = supabase
    .from("v_contacts_overview")
    .select("*")
    .order("open_tasks", { ascending: false });

  if (filters?.stage) query = query.eq("pipeline_stage", filters.stage);
  if (filters?.owner) query = query.eq("owner_name", filters.owner);
  if (filters?.literacy)
    query = query.eq("bitcoin_literacy", filters.literacy);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getContactById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*, companies(name, industry), team_members!contacts_owner_id_fkey(full_name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createContact(input: {
  first_name: string;
  last_name: string;
  job_title?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  company_id?: string;
  pipeline_stage?: string;
  bitcoin_literacy?: string;
  owner_id?: string;
  created_by?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contacts")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateContact(
  id: string,
  input: Record<string, unknown>
) {
  const supabase = createClient();
  const { error } = await supabase.from("contacts").update(input).eq("id", id);
  if (error) throw error;
}
