import LoadingRows from "@/components/shared/LoadingRows";

export default function Loading() {
  return (
    <div className="py-4">
      <LoadingRows count={4} />
    </div>
  );
}
