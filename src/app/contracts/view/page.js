import { Suspense } from "react";
import { QueryProvider } from "@/lib/query/queryClient";
import { Toaster, SocketNotifications, LoadingNote } from "@/components/shared";
import { ContractApprovalView } from "@/components/modules/contracts/ContractApprovalView";

export default function ContractViewPage() {
  return (
    <QueryProvider>
      <Suspense fallback={<LoadingNote>Loading Contract...</LoadingNote>}>
        <ContractApprovalView />
      </Suspense>
      <SocketNotifications />
      <Toaster />
    </QueryProvider>
  );
}
