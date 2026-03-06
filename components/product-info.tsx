"use client"

import { Star, ShieldCheck, Store as StoreIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { ProductWithRelations } from "@/lib/db"

interface ProductInfoProps {
  product: ProductWithRelations
}

export function ProductInfo({ product }: ProductInfoProps) {
  const categoryName = product.category?.name || "Produto"
  const storeName = product.store?.name || "Loja parceira"
  
  // Obter o link de afiliado
  const affiliateLink = product.activeLink?.url || "#"

  const handleOfferClick = () => {
    // Registrar clique no banco
    fetch("/api/cliques", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produto_id: product.id,
        cupom_id: product.activeCoupon?.id || null,
      }),
    }).catch(() => {})
  }

  return (
    <div className="flex flex-col">
      {/* Category & Store */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{categoryName}</Badge>
        <Badge variant="outline" className="gap-1">
          <StoreIcon className="h-3 w-3" />
          {storeName}
        </Badge>
      </div>

      {/* Title */}
      <h1 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(product.rating)
                  ? "fill-primary text-primary"
                  : "fill-muted text-muted"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-foreground">{product.rating}</span>
        <span className="text-sm text-muted-foreground">({product.reviewCount} avaliações)</span>
      </div>

      {/* Price */}
      <div className="mt-4 flex items-end gap-3">
        <span className="text-3xl font-bold text-foreground">
          R$ {(product.currentPrice || 0).toFixed(2).replace(".", ",")}
        </span>
        {product.originalPrice && product.currentPrice && (
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground line-through">
              R$ {product.originalPrice.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-xs font-medium text-primary">
              Economia de R$ {(product.originalPrice - product.currentPrice).toFixed(2).replace(".", ",")}
            </span>
          </div>
        )}
      </div>

      <Separator className="my-5" />

      {/* Description */}
      <p className="text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      {/* CTA - abre link de afiliado em nova aba */}
      <div className="mt-6 flex flex-col gap-3">
        <Button asChild size="lg" className="w-full gap-2 text-base">
          <a href={affiliateLink} target="_blank" rel="noopener noreferrer" onClick={handleOfferClick}>
            <ShieldCheck className="h-5 w-5" />
            Ver Oferta Verificada
          </a>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Você será redirecionado para a loja parceira de forma segura.
        </p>
      </div>
    </div>
  )
}
