import { getContentItems } from "@/lib/queries/content";
import ContentClient from "./ContentClient";

export default async function ContentPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const items = await getContentItems(searchParams.filter);
  return <ContentClient initialItems={items} />;
}
