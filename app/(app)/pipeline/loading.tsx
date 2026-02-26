import LoadingRows from "@/components/shared/LoadingRows";

export default function Loading() {
  return (
    <div className="py-4">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-16 bg-[--surface] border border-[--border] rounded-[4px] animate-pulse"
          />
        ))}
      </div>
      <LoadingRows count={5} />
    </div>
  );
}
