import { createClient } from "@/lib/supabase/server";

export async function getRecentInteractions(limit = 8) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("v_recent_interactions")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getContactInteractions(contactId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("contact_id", contactId)
    .order("occurred_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createInteraction(input: {
  contact_id: string;
  type: string;
  direction?: string;
  occurred_at?: string;
  raw_content?: string;
  summary?: string;
  created_by?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("interactions")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}
