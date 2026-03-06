"use client"

import { Copy, CheckCircle2, BadgeCheck, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import type { CouponWithRelations } from "@/lib/db"

interface CouponCardProps {
  coupon: CouponWithRelations
}

export function CouponCard({ coupon }: CouponCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(coupon.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const storeName = coupon.store?.name || "Loja"

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {storeName}
          </Badge>
          {coupon.isVerified && (
            <BadgeCheck className="h-4 w-4 text-primary" />
          )}
        </div>
        <p className="mt-2 text-sm font-medium text-foreground">{coupon.description}</p>
        <p className="mt-1 text-2xl font-bold text-primary">{coupon.discountText}</p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-1.5 text-center text-sm font-mono font-semibold text-primary">
          {coupon.code}
        </code>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleCopy}
          aria-label={copied ? "Copiado" : "Copiar cupom"}
        >
          {copied ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      {coupon.link && (
        <a
          href={coupon.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2"
        >
          <Button variant="default" size="sm" className="w-full gap-1">
            Ver Oferta
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </a>
      )}
    </div>
  )
}
