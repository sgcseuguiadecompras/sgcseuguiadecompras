"use client"

import { Star, ShieldCheck, Store as StoreIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShareButtons } from "@/components/share-buttons"
import { SaveButton } from "@/components/save-button"
import type { ProductWithRelations } from "@/lib/db"

interface ProductInfoProps {
  product: ProductWithRelations
}

export function ProductInfo({ product }: ProductInfoProps) {
  const categoryName = product.category?.name || "Produto"
  const storeName = product.store?.name || "Loja parceira"
  
  // Obter o link de afiliado
  const affiliateLink = product.activeLink?.url || "#"
  
  // URL para compartilhamento
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const productUrl = `${baseUrl}/produto/${product.slug}`

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
      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      {/* Actions: Salvar e Compartilhar */}
      <div className="mt-4 flex items-center gap-2">
        <SaveButton produtoId={product.id} lojaId={product.store?.id} variant="full" />
        <ShareButtons 
          url={productUrl} 
          title={product.name} 
          description={product.shortDescription} 
        />
      </div>

      {/* CTA - abre link de afiliado em nova aba */}
      <div className="mt-6 flex flex-col gap-3">
        <Button 
          size="lg" 
          className="w-full gap-2 text-base"
          onClick={() => {
            handleOfferClick()
            window.open(affiliateLink, "_blank", "noopener,noreferrer")
          }}
        >
          <ShieldCheck className="h-5 w-5" />
          Ver Oferta Verificada
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Você será redirecionado para a loja parceira de forma segura.
        </p>
      </div>
    </div>
  )
}
