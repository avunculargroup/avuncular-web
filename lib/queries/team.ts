import { createClient } from "@/lib/supabase/server";

export async function getTeamMembers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
