import { supabaseProductRepository } from "@/lib/supabase/products"
import { ProductCard } from "@/components/product-card"
import { Award } from "lucide-react"

export async function TopRatedProducts() {
  const topRated = await supabaseProductRepository.getTopRatedProducts(8)

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-10 flex items-center justify-center gap-3 text-center">
          <Award className="h-7 w-7 text-primary" />
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Mais Bem Avaliados
            </h2>
            <p className="mt-1 text-muted-foreground">
              Escolhidos pelos nossos usuários
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topRated.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
