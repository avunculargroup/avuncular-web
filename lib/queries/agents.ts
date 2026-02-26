import { createClient } from "@/lib/supabase/server";

export async function getPendingApprovals() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("agent_activity")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getAgentStatuses() {
  const supabase = createClient();
  const fiveMinutesAgo = new Date(
    Date.now() - 5 * 60 * 1000
  ).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("agent_activity")
    .select("*")
    .gte("created_at", oneHourAgo)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const agents = ["coordinator", "crm", "tasks", "content"];
  return agents.map((name) => {
    const activities = (data ?? []).filter((a) => a.agent_name === name);
    const latest = activities[0] ?? null;
    const hasPending = activities.some((a) => a.status === "pending");
    const isActive = latest
      ? new Date(latest.created_at) >= new Date(fiveMinutesAgo)
      : false;

    return {
      name,
      latest,
      status: hasPending ? "pending" : isActive ? "active" : "idle",
    };
  });
}

export async function getRecentAgentActivity(limit = 50) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("agent_activity")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getAgentActivityById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("agent_activity")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getAgentsOnlineCount() {
  const supabase = createClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("agent_activity")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "auto"])
    .gte("created_at", oneHourAgo);

  if (error) throw error;
  return count ?? 0;
}
