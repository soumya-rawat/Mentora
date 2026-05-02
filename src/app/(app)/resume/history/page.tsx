import { redirect } from "next/navigation";

// Resume history redirects to main resume page for now
export default function ResumeHistoryPage() {
  redirect("/resume");
}
