import Link from "next/link"
import { Smartphone, Home, Shirt, Sparkles, Dumbbell, BookOpen, Gamepad2, Car, Package } from "lucide-react"
import { supabaseCategoryRepository } from "@/lib/supabase/categories"
import { CategoryIcon } from "./category-icon"

const iconMap: Record<string, React.ElementType> = {
  Smartphone,
  Home,
  Shirt,
  Sparkles,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Car,
  Package,
}

export async function CategoryGrid() {
  const categories = await supabaseCategoryRepository.getActiveCategories()
  
  return (
    <section id="categorias" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Explore por Categoria
          </h2>
          <p className="mt-2 text-muted-foreground">
            Encontre os melhores produtos em cada categoria
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {categories.map((cat) => {
            const iconUrl = cat.imageUrl?.trim() || ""
            
            return (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:bg-primary/10 overflow-hidden">
                  <CategoryIcon 
                    imageUrl={iconUrl} 
                    iconName={cat.icon} 
                    name={cat.name}
                    className="h-6 w-6"
                  />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-foreground">{cat.name}</span>
                  <p className="mt-0.5 text-xs text-muted-foreground">{cat.productCount} produtos</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
