"use client"

import { useState } from "react"
import { Copy, CheckCircle2, BadgeCheck, Clock, Filter, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { CouponWithRelations } from "@/lib/db"

interface CouponsClientProps {
  coupons: CouponWithRelations[]
  stores: string[]
}

function CouponCardFull({ coupon }: { coupon: CouponWithRelations }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    
    // Registrar clique
    fetch("/api/cliques", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produto_id: null, cupom_id: coupon.id }),
    }).catch(() => {})
  }

  const handleLinkClick = () => {
    fetch("/api/cliques", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produto_id: null, cupom_id: coupon.id }),
    }).catch(() => {})
  }

  // Calcular dias restantes
  const daysLeft = coupon.expiresAt 
    ? Math.max(0, Math.ceil((new Date(coupon.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const storeName = coupon.store?.name || "Geral"

  // Formatar data de validade
  const formatDate = (date: Date | undefined) => {
    if (!date) return null
    return new Date(date).toLocaleDateString("pt-BR")
  }

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">{storeName}</Badge>
          {coupon.isVerified && (
            <div className="flex items-center gap-1 text-primary">
              <BadgeCheck className="h-4 w-4" />
              <span className="text-xs font-medium">Verificado</span>
            </div>
          )}
        </div>

        <p className="mt-3 text-base font-medium text-foreground whitespace-pre-line">
          {coupon.description || "Cupom de desconto"}
        </p>

        {daysLeft !== null && (
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {daysLeft > 0 
                ? `${daysLeft} dias restantes (${formatDate(coupon.expiresAt)})`
                : daysLeft === 0 
                  ? "Expira hoje!"
                  : "Expirado"
              }
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {/* Exibir codigo se existir */}
        {coupon.code && coupon.code.trim() !== "" && (
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-2.5 text-center font-mono text-sm font-bold text-primary">
              {coupon.code}
            </code>
            <Button
              onClick={handleCopy}
              variant={copied ? "default" : "outline"}
              className="gap-1.5 px-4"
              aria-label={copied ? "Cupom copiado" : "Copiar cupom"}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        )}
        
        {/* Botao Resgatar se tiver link */}
        {coupon.link && (
          <a
            href={coupon.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="block"
          >
            <Button variant="default" size="sm" className="w-full gap-1">
              Resgatar
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        )}
      </div>
    </div>
  )
}

export function CouponsClient({ coupons, stores }: CouponsClientProps) {
  const [activeStore, setActiveStore] = useState("Todos")

  const filteredCoupons = activeStore === "Todos"
    ? coupons
    : coupons.filter(c => c.store?.name === activeStore)

  return (
    <>
      {/* Store Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {["Todos", ...stores].map((store) => (
          <Button
            key={store}
            variant={activeStore === store ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveStore(store)}
            className="text-xs"
          >
            {store}
          </Button>
        ))}
      </div>

      {/* Coupons Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCoupons.map((coupon) => (
          <CouponCardFull key={coupon.id} coupon={coupon} />
        ))}
      </div>

      {filteredCoupons.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-foreground">Nenhum cupom encontrado</p>
          <p className="mt-1 text-xs text-muted-foreground">Tente outro filtro ou volte mais tarde.</p>
        </div>
      )}
    </>
  )
}
