import { redirect } from "next/navigation";

/** Monthly payments are a tab of the Payments page. */
export default function SupervisionMonthlyPaymentsPage() {
  redirect("/admin/supervision-payments?tab=monthly");
}
