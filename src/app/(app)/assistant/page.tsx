import { redirect } from "next/navigation";

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  redirect(params.c ? `/chat?c=${params.c}` : "/chat");
}
