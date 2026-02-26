import { createClient as createServiceClient } from "@supabase/supabase-js";
import PublicFormView from "./PublicFormView";

async function getFormBySlug(slug: string) {
  // Use a direct client since this is a public/unauthenticated route
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) return null;
  return data;
}

export default async function PublicFormPage({
  params,
}: {
  params: { slug: string };
}) {
  const form = await getFormBySlug(params.slug);

  if (!form) {
    return (
      <div className="text-center">
        <h1 className="text-lg font-medium text-gray-900 mb-2">
          Form Not Found
        </h1>
        <p className="text-sm text-gray-500">
          This form does not exist or is no longer available.
        </p>
      </div>
    );
  }

  return <PublicFormView form={form} />;
}
