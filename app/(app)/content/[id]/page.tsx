import { notFound } from "next/navigation";
import { getContentById } from "@/lib/queries/content";
import ContentDetailView from "./ContentDetailView";

export default async function ContentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await getContentById(params.id).catch(() => null);
  if (!item) notFound();
  return <ContentDetailView item={item} />;
}
