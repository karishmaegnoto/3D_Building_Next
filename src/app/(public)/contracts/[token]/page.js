import { QueryProvider } from "@/lib/query/queryClient";
import { PublicContractSignView } from "@/components/modules/contracts/PublicContractSignView";

export default function PublicContractPage({ params, searchParams }) {
  return (
    <QueryProvider>
      <PublicContractSignView token={params?.token} searchParams={searchParams} />
    </QueryProvider>
  );
}
