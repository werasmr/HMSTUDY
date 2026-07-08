import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { UserNav } from "@/components/layout/user-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getUserContext();
  if (!ctx) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar company={ctx.company} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="md:hidden">
            <p className="text-sm font-semibold">{ctx.company.name}</p>
          </div>
          <UserNav profile={ctx.profile} />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
