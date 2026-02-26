import { createClient } from "@/lib/supabase/server";

export async function getContentItems(filter?: string) {
  const supabase = createClient();
  let query = supabase
    .from("content_items")
    .select("*, team_members!content_items_assigned_to_fkey(full_name)")
    .order("updated_at", { ascending: false });

  if (filter && filter !== "all") {
    query = query.eq("status", filter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getContentById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*, team_members!content_items_assigned_to_fkey(full_name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createContent(input: {
  title: string;
  type: string;
  topic_tags?: string[];
  body?: string;
  created_by?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("content_items")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateContent(
  id: string,
  input: Record<string, unknown>
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("content_items")
    .update(input)
    .eq("id", id);
  if (error) throw error;
}
