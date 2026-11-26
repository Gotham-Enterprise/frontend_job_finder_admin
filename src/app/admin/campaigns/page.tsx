import { redirect } from "next/navigation";

// "Campaigns" is a section; it opens on the managed campaigns queue.
export default function CampaignsPage() {
  redirect("/admin/campaigns/managed");
}
