import { Suspense } from "react";
import { ManufacturerEdit } from "@/components/modules/manufacturer/ManufacturerEdit";
import { LoadingNote } from "@/components/shared";

export default function EditManufacturerPage() {
  return (
    <Suspense fallback={<LoadingNote>Loading Edit Manufacturer...</LoadingNote>}>
      <ManufacturerEdit />
    </Suspense>
  );
}
