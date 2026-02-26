import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = createClient();

  const [contactsRes, projectsRes, contentRes, tasksRes] = await Promise.all([
    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .in("pipeline_stage", ["warm", "active", "client"]),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("content_items")
      .select("*", { count: "exact", head: true })
      .in("status", ["idea", "draft", "review"]),
    supabase
      .from("v_open_tasks")
      .select("*", { count: "exact", head: true }),
  ]);

  return {
    pipelineContacts: contactsRes.count ?? 0,
    activeClients: projectsRes.count ?? 0,
    contentDrafts: contentRes.count ?? 0,
    openTasks: tasksRes.count ?? 0,
  };
}
