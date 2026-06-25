import { Suspense } from "react";
import { SearchResults } from "./SearchResults";
import { SkeletonGrid } from "@/components/common/SkeletonGrid";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-6"><SkeletonGrid count={4} /></div>}>
      <SearchResults />
    </Suspense>
  );
}
