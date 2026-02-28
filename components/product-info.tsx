"use client"

import Link from "next/link"
import { Star, ThumbsUp, ThumbsDown, ShieldCheck, Store as StoreIcon, Tag, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { ProductWithRelations } from "@/lib/db"
import { useState } from "react"

interface ProductInfoProps {
  product: ProductWithRelations
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null)

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCoupon(code)
    setTimeout(() => setCopiedCoupon(null), 2000)
  }

  const categoryName = product.category?.name || "Produto"
  const storeName = product.store?.name || "Loja parceira"

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

      {/* Pros and Cons */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <ThumbsUp className="h-4 w-4 text-primary" />
            Pontos Positivos
          </h3>
          <ul className="flex flex-col gap-1.5">
            {product.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {pro}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <ThumbsDown className="h-4 w-4 text-destructive" />
            Pontos Negativos
          </h3>
          <ul className="flex flex-col gap-1.5">
            {product.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA - redirects to internal /r/slug */}
      <div className="mt-6 flex flex-col gap-3">
        <Button asChild size="lg" className="w-full gap-2 text-base">
          <Link href={`/r/${product.slug}`}>
            <ShieldCheck className="h-5 w-5" />
            Ver Oferta Verificada
          </Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Você será redirecionado para a loja parceira de forma segura.
        </p>
      </div>
    </div>
  )
}
