import { redirect } from "next/navigation";
import { LeadForm } from "@/components/modules/leads";

export const metadata = {
  title: "Edit Lead | GripCRM",
  description: "View and edit lead details and specifications",
};

export default function EditLeadPage({ params }) {
  const { id } = params || {};
  if (id) redirect(`/lead/edit-lead/${id}`);
  return <LeadForm leadId={id} />;
}
