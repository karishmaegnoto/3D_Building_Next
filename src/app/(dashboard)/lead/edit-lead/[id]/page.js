import { LeadForm } from "@/components/modules/leads";

export const metadata = {
  title: "Edit Lead | GripCRM",
  description: "View and edit lead details and specifications",
};

export default function LeadEditLeadPage({ params }) {
  const { id } = params || {};
  return <LeadForm leadId={id} />;
}
