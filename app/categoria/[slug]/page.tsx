import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"
import { supabaseProductRepository } from "@/lib/supabase/products"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const categoria = await supabaseProductRepository.getCategoryBySlug(slug)

  if (!categoria) {
    return {
      title: "Categoria não encontrada | SGC",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seuguiadecompras.com.br"
  const categoryUrl = `${baseUrl}/categoria/${slug}`
  const description = `Encontre os melhores produtos de ${categoria.name} com as melhores ofertas e cupons de desconto.`

  return {
    title: `${categoria.name} | SGC - Seu Guia de Compras`,
    description,
    openGraph: {
      title: `${categoria.name} | SGC - Seu Guia de Compras`,
      description,
      type: "website",
      url: categoryUrl,
      locale: "pt_BR",
      siteName: "SGC - Seu Guia de Compras",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `Produtos de ${categoria.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoria.name} | SGC`,
      description,
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: `/categoria/${slug}`,
    },
  }
}

export default async function CategoriaPage({ params }: Props) {
  const { slug } = await params
  const categoria = await supabaseProductRepository.getCategoryBySlug(slug)

  if (!categoria) {
    notFound()
  }

  const produtos = await supabaseProductRepository.getProductsByCategory(slug)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              {(() => {
                const iconUrl = categoria.imageUrl?.trim() || ""
                const hasIconUrl = iconUrl.length > 0
                
                if (hasIconUrl) {
                  return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                      <img 
                        src={iconUrl} 
                        alt={categoria.name}
                        className="h-6 w-6 object-contain"
                      />
                    </div>
                  )
                } else {
                  return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                  )
                }
              })()}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{categoria.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {produtos.length} {produtos.length === 1 ? "produto encontrado" : "produtos encontrados"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {produtos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              Nenhum produto nesta categoria
            </h2>
            <p className="mt-2 text-muted-foreground">
              Ainda não há produtos cadastrados nesta categoria.
            </p>
            <Button asChild className="mt-6">
              <Link href="/">Voltar para a Home</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {produtos.map((produto) => (
              <ProductCard key={produto.id} product={produto} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
