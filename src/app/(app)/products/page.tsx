import { Suspense } from "react";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "@/app/actions/products";
import { EntityCrud } from "@/components/crud/entity-crud";
import { DescriptionGenerator } from "@/components/products/description-generator";
import {
  productColumns,
  productFields,
  productFilters,
} from "@/lib/crud/configs/products";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = await searchParams;
  const products = await listProducts(filters);

  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <EntityCrud
        title="Продукты"
        description="Каталог товаров и услуг. Генерация описания через Claude."
        rows={products}
        fields={productFields}
        filters={productFilters}
        columns={productColumns}
        searchPlaceholder="Название товара или услуги..."
        formFooter={({ formId }) => <DescriptionGenerator formId={formId} />}
        createAction={createProduct}
        updateAction={updateProduct}
        deleteAction={deleteProduct}
      />
    </Suspense>
  );
}
