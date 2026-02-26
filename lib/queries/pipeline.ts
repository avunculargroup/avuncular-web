import { createClient } from "@/lib/supabase/server";

const STAGES = ["lead", "warm", "active", "client", "dormant"] as const;

export async function getContactStageCounts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("pipeline_stage");

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const stage of STAGES) {
    counts[stage] = 0;
  }
  for (const row of data ?? []) {
    counts[row.pipeline_stage] = (counts[row.pipeline_stage] || 0) + 1;
  }
  return counts;
}

export async function getPipelineTotal() {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .in("pipeline_stage", ["warm", "active"]);

  if (error) throw error;
  return count ?? 0;
}
