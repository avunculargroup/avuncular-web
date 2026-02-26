import { notFound } from "next/navigation";
import { getProjectById, getProjectTasks } from "@/lib/queries/projects";
import EngagementDetailView from "./EngagementDetailView";

export default async function EngagementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, tasks] = await Promise.all([
    getProjectById(params.id).catch(() => null),
    getProjectTasks(params.id),
  ]);

  if (!project) notFound();

  return <EngagementDetailView project={project} tasks={tasks} />;
}
