export default function LoadingRows({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-px">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3 border-b border-[--border] animate-pulse"
        >
          <div className="w-8 h-8 rounded-[4px] bg-[--surface-2]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-[--surface-2] rounded w-3/4" />
            <div className="h-2 bg-[--surface-2] rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
