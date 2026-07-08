import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { UserNav } from "@/components/layout/user-nav";

export const dynamic = "force-dynamic";

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
    <div className="flex min-h-screen bg-background">
      <AppSidebar company={ctx.company} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-card/80 px-6 backdrop-blur-md">
          <div className="md:hidden">
            <p className="text-sm font-semibold">{ctx.company.name}</p>
          </div>
          <div className="ml-auto">
            <UserNav profile={ctx.profile} />
          </div>
        </header>
        <main className="flex-1 bg-muted/30 p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
