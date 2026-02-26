import { getActiveProjects } from "@/lib/queries/projects";
import ClientsClient from "./ClientsClient";

export default async function ClientsPage() {
  const projects = await getActiveProjects();

  return <ClientsClient initialProjects={projects} />;
}
