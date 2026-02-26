import { createClient } from "@/lib/supabase/server";

export async function getActiveProjects() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, companies!projects_related_company_id_fkey(name)")
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getProjectById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, companies!projects_related_company_id_fkey(name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectTasks(projectId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*, team_members!tasks_assigned_to_fkey(full_name)")
    .eq("project_id", projectId)
    .order("status", { ascending: true })
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createProject(input: {
  name: string;
  description?: string;
  related_company_id?: string;
  created_by?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}
