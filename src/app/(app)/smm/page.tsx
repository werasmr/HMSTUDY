import { Suspense } from "react";
import {
  createSocialPost,
  deleteSocialPost,
  listSocialAccountOptions,
  listSocialPosts,
  updateSocialPost,
} from "@/app/actions/smm";
import { EntityCrud } from "@/components/crud/entity-crud";
import {
  socialPostColumns,
  socialPostFields,
  socialPostFilters,
} from "@/lib/crud/configs/smm";

type SmmPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

const SMM_NAV = [
  { href: "/smm", label: "Посты", isActive: true },
  { href: "/smm/accounts", label: "Аккаунты" },
];

export default async function SmmPage({ searchParams }: SmmPageProps) {
  const filters = await searchParams;
  const [posts, accountOptions] = await Promise.all([
    listSocialPosts(filters),
    listSocialAccountOptions(),
  ]);

  return (
    <Suspense fallback={null}>
      <EntityCrud
        title="SMM"
        description="Планирование и публикация постов. Отметьте «Опубликован» вручную после публикации."
        rows={posts}
        fields={socialPostFields}
        filters={socialPostFilters}
        columns={socialPostColumns}
        moduleNav={SMM_NAV}
        dynamicOptions={{
          social_account_id: [{ value: "", label: "—" }, ...accountOptions],
        }}
        createAction={createSocialPost}
        updateAction={updateSocialPost}
        deleteAction={deleteSocialPost}
      />
    </Suspense>
  );
}
