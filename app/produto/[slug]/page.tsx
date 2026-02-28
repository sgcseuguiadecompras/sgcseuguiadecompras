import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { productRepository, reviewRepository, storeRepository } from "@/lib/db"
import { ProductGallery } from "@/components/product-gallery"
import { ProductInfo } from "@/components/product-info"
import { ProductReviews } from "@/components/product-reviews"
import { RelatedProducts } from "@/components/related-products"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await productRepository.findBySlugWithRelations(slug)
  if (!product) return { title: "Produto não encontrado" }

  return {
    title: `${product.name} - Vale a Pena? Avaliação Completa`,
    description: `${product.shortDescription}. Confira avaliação detalhada, preço atual de R$ ${(product.currentPrice || 0).toFixed(2).replace(".", ",")}, cupons disponíveis e opinião de usuários reais.`,
    openGraph: {
      title: `${product.name} | SGC - Seu Guia de Compras`,
      description: `${product.shortDescription}. Avaliação completa com prós e contras.`,
      type: "article",
    },
    alternates: {
      canonical: `/produto/${slug}`,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await productRepository.findBySlugWithRelations(slug)

  if (!product) {
    notFound()
  }

  // Reviews vinculados ao productId interno
  const reviewsList = await reviewRepository.getByProduct(product.id)
  
  // Buscar nome da loja para o Schema.org
  let storeName = "Loja parceira"
  if (product.activeLink) {
    const store = await storeRepository.findById(product.activeLink.storeId)
    storeName = store?.name || storeName
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      "@type": "Offer",
      price: product.currentPrice || 0,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: storeName,
      },
    },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li><a href="/" className="hover:text-foreground">Início</a></li>
          <li className="text-border">/</li>
          <li><a href="/#produtos" className="hover:text-foreground">{product.category?.name || "Produtos"}</a></li>
          <li className="text-border">/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      {/* Product Main */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery product={product} />
        <ProductInfo product={product} />
      </div>

      {/* Reviews */}
      <ProductReviews product={product} reviews={reviewsList} />

      {/* Related Products */}
      <RelatedProducts currentProduct={product} />
    </div>
  )
}
