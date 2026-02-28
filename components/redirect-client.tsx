"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShieldCheck, ExternalLink, ArrowLeft, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RedirectClientProps {
  productName: string
  productSlug: string
  storeName: string
  affiliateUrl?: string
  price: number
  discount?: number
}

export function RedirectClient({
  productName,
  productSlug,
  storeName,
  affiliateUrl,
  price,
  discount,
}: RedirectClientProps) {
  const [countdown, setCountdown] = useState(5)
  const [redirected, setRedirected] = useState(false)

  useEffect(() => {
    if (!affiliateUrl) return

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setRedirected(true)
          window.open(affiliateUrl, "_blank", "noopener,noreferrer")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [affiliateUrl])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto w-full max-w-lg">
        {/* Progress indicator */}
        <div className="mb-8 flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-primary/10">
          {!redirected ? (
            <div className="relative">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-primary/20"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-primary transition-all duration-1000 ease-linear"
                  strokeDasharray={`${((5 - countdown) / 5) * 125.6} 125.6`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-primary">
                {countdown}
              </span>
            </div>
          ) : (
            <ShieldCheck className="h-10 w-10 text-primary" />
          )}
        </div>

        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
          {redirected ? "Oferta aberta!" : "Preparando sua oferta..."}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {redirected ? (
            <>A loja <strong className="text-foreground">{storeName}</strong> foi aberta em uma nova aba.</>
          ) : (
            <>Você será redirecionado para <strong className="text-foreground">{productName}</strong> na loja{" "}
            <strong className="text-foreground">{storeName}</strong> em {countdown} segundos.</>
          )}
        </p>

        {/* Price highlight */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-6 py-3">
          <Tag className="h-5 w-5 text-primary" />
          <div className="text-left">
            <p className="text-lg font-bold text-foreground">
              R$ {price.toFixed(2).replace(".", ",")}
            </p>
            {discount && (
              <p className="text-xs font-medium text-primary">
                {discount}% de desconto
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col gap-3">
          {affiliateUrl && (
            <Button asChild size="lg" className="w-full gap-2">
              <a href={affiliateUrl} target="_blank" rel="noopener noreferrer sponsored">
                <ExternalLink className="h-4 w-4" />
                {redirected ? "Abrir loja novamente" : "Ir para a loja agora"}
              </a>
            </Button>
          )}

          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href={`/produto/${productSlug}`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar para a avaliação
            </Link>
          </Button>
        </div>

        {/* Affiliate disclaimer */}
        <div className="mt-8 rounded-lg border border-border bg-card p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Transparência:</strong> Este é um link de afiliado. 
            Ao realizar uma compra através deste link, o SGC pode receber uma pequena comissão sem nenhum 
            custo adicional para você. Isso nos ajuda a manter o site funcionando e continuar oferecendo 
            avaliações independentes.
          </p>
        </div>
      </div>
    </div>
  )
}
