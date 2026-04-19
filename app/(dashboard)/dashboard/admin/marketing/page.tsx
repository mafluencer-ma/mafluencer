import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MarketingContent from "./_content";

export const metadata = { title: "Marketing — Mafluencer Admin" };

export default async function MarketingPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "MANAGER") redirect("/dashboard");
  return <MarketingContent />;
}
