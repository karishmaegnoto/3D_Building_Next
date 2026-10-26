"use client";

import { Suspense } from "react";
import { QueryProvider } from "@/lib/query/queryClient";
import { Toaster, SocketNotifications, LoadingNote } from "@/components/shared";
import { QuoteApprovalView } from "@/components/modules/quotes/QuoteApprovalView";

export default function QuoteViewPage() {
  return (
    <QueryProvider>
      <Suspense fallback={<LoadingNote>Loading Quote...</LoadingNote>}>
        <QuoteApprovalView />
      </Suspense>
      <SocketNotifications />
      <Toaster />
    </QueryProvider>
  );
}
