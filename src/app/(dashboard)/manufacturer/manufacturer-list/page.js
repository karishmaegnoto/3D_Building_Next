import { Suspense } from "react";
import { ManufacturerList } from "@/components/modules/manufacturer/ManufacturerList";
import { LoadingNote } from "@/components/shared";

export default function ManufacturerListPage() {
  return (
    <Suspense fallback={<LoadingNote>Loading Manufacturers...</LoadingNote>}>
      <ManufacturerList />
    </Suspense>
  );
}
