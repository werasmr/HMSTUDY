import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Proto — AI-платформа для малого бизнеса",
  description:
    "CRM, финансы, сотрудники и аналитика в одном месте. Попробуйте Proto бесплатно — меньше рутины, больше роста.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return <LandingPage />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
