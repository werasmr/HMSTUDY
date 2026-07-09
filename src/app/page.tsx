import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Proto — AI-инструмент автоматизации бизнеса",
  description:
    "Финансы, клиенты, сотрудники, цены и соцсети в одном месте. Попробуйте Proto бесплатно — меньше рутины, больше роста.",
};

export default function HomePage() {
  return <LandingPage />;
}
