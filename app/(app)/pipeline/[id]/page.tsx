import { notFound } from "next/navigation";
import { getContactById } from "@/lib/queries/contacts";
import { getContactInteractions } from "@/lib/queries/interactions";
import { getContactTasks } from "@/lib/queries/tasks";
import ContactDetailView from "./ContactDetailView";

export default async function ContactDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [contact, interactions, tasks] = await Promise.all([
    getContactById(params.id).catch(() => null),
    getContactInteractions(params.id),
    getContactTasks(params.id),
  ]);

  if (!contact) notFound();

  return (
    <ContactDetailView
      contact={contact}
      interactions={interactions}
      tasks={tasks}
    />
  );
}
