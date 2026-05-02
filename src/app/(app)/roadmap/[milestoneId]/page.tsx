import { redirect } from "next/navigation";

// Milestone detail page redirects to main roadmap for now
export default function MilestoneDetailPage() {
  redirect("/roadmap");
}
