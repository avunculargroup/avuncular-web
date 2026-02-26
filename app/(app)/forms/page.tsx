import { getForms } from "@/lib/queries/forms";
import SectionHeader from "@/components/shared/SectionHeader";
import EmptyState from "@/components/shared/EmptyState";
import Badge from "@/components/shared/Badge";
import { FileText } from "lucide-react";

export default async function FormsPage() {
  const forms = await getForms();

  return (
    <div className="py-4 space-y-4">
      <SectionHeader>Forms ({forms.length})</SectionHeader>

      {forms.length > 0 ? (
        <div className="bg-[--surface] border border-[--border] rounded-[6px] overflow-hidden">
          {forms.map((form) => (
            <div
              key={form.id}
              className="flex items-center gap-3 p-3 border-b border-[--border] last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[--text]">{form.name}</span>
                  <Badge variant={form.is_published ? "green" : "muted"}>
                    {form.is_published ? "published" : "draft"}
                  </Badge>
                </div>
                <span className="font-mono text-[9px] text-[--text-dim]">
                  /forms/{form.slug}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={FileText} message="No forms created yet" />
      )}
    </div>
  );
}
