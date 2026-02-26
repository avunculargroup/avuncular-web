import { createClient } from "@/lib/supabase/server";

export async function getMyOpenTasks(userId: string, limit = 5) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("v_open_tasks")
    .select("*")
    .eq("assigned_to_name", userId)
    .order("due_date", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getAllOpenTasks() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("v_open_tasks")
    .select("*")
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getContactTasks(contactId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*, team_members!tasks_assigned_to_fkey(full_name)")
    .eq("related_contact_id", contactId)
    .not("status", "in", "(done,cancelled)")
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createTask(input: {
  title: string;
  description?: string;
  project_id?: string;
  assigned_to?: string;
  due_date?: string;
  priority?: string;
  related_contact_id?: string;
  created_by?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTaskStatus(
  id: string,
  status: string,
  completedAt?: string
) {
  const supabase = createClient();
  const update: Record<string, unknown> = { status };
  if (status === "done") {
    update.completed_at = completedAt ?? new Date().toISOString();
  }
  const { error } = await supabase.from("tasks").update(update).eq("id", id);
  if (error) throw error;
}

export async function reassignTask(id: string, assignedTo: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ assigned_to: assignedTo })
    .eq("id", id);
  if (error) throw error;
}

export async function getOpenTasksCount() {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("v_open_tasks")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}
