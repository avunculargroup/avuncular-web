import { getAllOpenTasks } from "@/lib/queries/tasks";
import { getTeamMembers } from "@/lib/queries/team";
import { getCurrentTeamMember } from "@/lib/auth";
import TasksClient from "./TasksClient";

export default async function TasksPage() {
  const [tasks, teamMembers, currentUser] = await Promise.all([
    getAllOpenTasks(),
    getTeamMembers(),
    getCurrentTeamMember(),
  ]);

  return (
    <TasksClient
      initialTasks={tasks}
      teamMembers={teamMembers}
      currentUserName={currentUser?.full_name ?? null}
    />
  );
}
