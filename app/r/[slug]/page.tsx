import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { RedirectClient } from "@/components/redirect-client"
import { productRepository, productLinkRepository, storeRepository } from "@/lib/db"

interface Props {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: "Redirecionando...",
  robots: "noindex, nofollow",
}

export default async function RedirectPage({ params }: Props) {
  const { slug } = await params
  
  // Buscar produto com relações
  const product = await productRepository.findBySlugWithRelations(slug)

  if (!product) {
    notFound()
  }

  // Buscar melhor link ativo
  const activeLink = await productLinkRepository.getBestLinkForProduct(product.id)
  
  // Buscar dados da loja
  let storeName = "Loja parceira"
  if (activeLink) {
    const store = await storeRepository.findById(activeLink.storeId)
    storeName = store?.name || storeName
  }

  return (
    <RedirectClient
      productName={product.name}
      productSlug={product.slug}
      storeName={storeName}
      affiliateUrl={activeLink?.url}
      price={activeLink?.price || product.currentPrice || 0}
      discount={activeLink?.discount || product.discount}
    />
  )
}
