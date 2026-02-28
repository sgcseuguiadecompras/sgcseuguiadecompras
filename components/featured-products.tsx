import { supabaseProductRepository } from "@/lib/supabase/products"
import { ProductCard } from "@/components/product-card"

export async function FeaturedProducts() {
  const featured = await supabaseProductRepository.getFeaturedProducts(8)

  return (
    <section id="produtos" className="bg-secondary/30 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Ofertas em Destaque
          </h2>
          <p className="mt-2 text-muted-foreground">
            Produtos selecionados e verificados pela nossa equipe
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
