import { productRepository } from "@/lib/db"
import { ProductCard } from "@/components/product-card"
import { Separator } from "@/components/ui/separator"
import type { ProductWithRelations } from "@/lib/db"

interface RelatedProductsProps {
  currentProduct: ProductWithRelations
}

export async function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  const related = await productRepository.getRelatedProducts(currentProduct.id, 4)

  if (related.length === 0) return null

  return (
    <section className="mt-12 lg:mt-16">
      <Separator className="mb-8" />

      <h2 className="mb-6 font-[family-name:var(--font-heading)] text-xl font-bold text-foreground md:text-2xl">
        Produtos Relacionados
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
