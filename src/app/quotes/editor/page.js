"use client";

import { Suspense } from "react";
import { QuoteEditor } from "@/components/modules/quotes/QuoteEditor";
import { LoadingNote } from "@/components/shared";

export default function QuoteEditorPage() {
  return (
    <Suspense fallback={<LoadingNote>Loading Quote Editor...</LoadingNote>}>
      <QuoteEditor />
    </Suspense>
  );
}
