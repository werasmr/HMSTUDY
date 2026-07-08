import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth";
import { SettingsPageClient } from "./settings-form";

export default async function SettingsPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect("/onboarding");

  return <SettingsPageClient ctx={ctx} />;
}
