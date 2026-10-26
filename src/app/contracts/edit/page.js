"use client";

import { Suspense } from "react";
import { ContractEditor } from "@/components/modules/contracts/ContractEditor";
import { LoadingNote } from "@/components/shared";

export default function ContractEditPage() {
  return (
    <Suspense fallback={<LoadingNote>Loading Contract Editor...</LoadingNote>}>
      <ContractEditor />
    </Suspense>
  );
}
