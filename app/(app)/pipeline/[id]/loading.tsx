import LoadingRows from "@/components/shared/LoadingRows";

export default function Loading() {
  return (
    <div className="py-4 space-y-4">
      <div className="h-3 w-12 bg-[--surface-2] rounded animate-pulse" />
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-[4px] bg-[--surface-2] animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-2/3 bg-[--surface-2] rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-[--surface-2] rounded animate-pulse" />
        </div>
      </div>
      <LoadingRows count={4} />
    </div>
  );
}
