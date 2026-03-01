"use client"

import Link from "next/link"
import { Star, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ProductWithRelations } from "@/lib/db"

interface ProductCardProps {
  product: ProductWithRelations
}

export function ProductCard({ product }: ProductCardProps) {
  const affiliateLink = product.activeLink?.url || "#"
  
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <div className="flex h-full items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Star className="h-10 w-10 text-primary/40" />
          </div>
        </div>
        {product.discount && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
            -{product.discount}%
          </Badge>
        )}
        <Badge variant="outline" className="absolute right-3 top-3 border-border bg-card/80 backdrop-blur-sm">
          {product.store?.name || "Loja"}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-primary">{product.category?.name || "Produto"}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {product.shortDescription}
        </p>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating)
                    ? "fill-primary text-primary"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-foreground">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-bold text-foreground">
            R$ {(product.currentPrice || 0).toFixed(2).replace(".", ",")}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              R$ {product.originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-4 flex gap-2">
          <Button size="sm" className="flex-1" variant="outline" asChild>
            <Link href={`/produto/${product.slug}`}>
              Ver Detalhes
            </Link>
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1"
            variant="default"
            asChild
          >
            <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
              Ver Oferta
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
