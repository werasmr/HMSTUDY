import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Proto — AI-платформа для малого бизнеса",
  description:
    "CRM, финансы, сотрудники и аналитика в одном месте. Попробуйте Proto бесплатно — меньше рутины, больше роста.",
};

export default function HomePage() {
  return <LandingPage />;
}
