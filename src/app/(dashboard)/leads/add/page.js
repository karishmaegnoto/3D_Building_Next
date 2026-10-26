import { redirect } from "next/navigation";

export const metadata = {
  title: "Add Lead | GripCRM",
  description: "Create and submit a new lead",
};

export default function AddLeadPage() {
  redirect("/lead/add-lead");
}
