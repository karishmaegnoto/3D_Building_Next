import { Suspense } from "react";
import { LoadingNote } from "@/components/shared";

import ManufacturersPage from "@/app/(dashboard)/manufacturers/page";

export default function AddManufacturerPage() {
  return (
    <Suspense fallback={<LoadingNote>Loading Add Manufacturer...</LoadingNote>}>
      <ManufacturersPage />
    </Suspense>
  );
}
