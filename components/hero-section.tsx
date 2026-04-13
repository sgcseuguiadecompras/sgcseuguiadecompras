"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Shield, Tag, Star, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Stats {
  totalCliques: number
  totalProdutos: number
  totalEconomia: number
  linksValidados: number
}

export function HeroSection() {
  const [stats, setStats] = useState<Stats>({
    totalCliques: 0,
    totalProdutos: 0,
    totalEconomia: 0,
    linksValidados: 99.2,
  })
  const [mensagemCompartilhar, setMensagemCompartilhar] = useState(
    "Confira as melhores ofertas e cupons no SGC - Seu Guia de Compras!"
  )

  useEffect(() => {
    fetch("/api/estatisticas")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})

    // Buscar mensagem personalizada de compartilhar
    fetch("/api/config?chave=mensagem_compartilhar")
      .then((res) => res.json())
      .then((data) => {
        if (data?.valor) {
          setMensagemCompartilhar(data.valor)
        }
      })
      .catch(() => {})
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "k+"
    }
    return num.toString() + "+"
  }

  return (
    <section className="relative overflow-hidden bg-background pb-16 pt-12 md:pb-24 md:pt-20">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5" />
        <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-accent/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-secondary-foreground">
              Ofertas verificadas e seguras
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-balance font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Compre Melhor.{" "}
            <span className="text-primary">Pague Menos.</span>{" "}
            Evite Golpes.
          </h1>

          {/* Subtext */}
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Avaliacoes reais, cupons atualizados e ofertas verificadas dos maiores marketplaces do Brasil.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2 px-8 text-base">
              <Link href="/#produtos">
                Ver Ofertas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 px-8 text-base"
              onClick={() => {
                const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://sgcseuguiadecompras.com.br"
                if (navigator.share) {
                  navigator.share({
                    title: "SGC - Seu Guia de Compras",
                    text: mensagemCompartilhar,
                    url: siteUrl,
                  })
                } else {
                  navigator.clipboard.writeText(`${mensagemCompartilhar} ${siteUrl}`)
                  alert("Link copiado!")
                }
              }}
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 px-8 text-base">
              <Link href="/cupons">
                <Tag className="h-4 w-4" />
                Ver Cupons
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-foreground md:text-3xl">{formatNumber(stats.totalProdutos)}</span>
              <span className="mt-1 text-xs text-muted-foreground md:text-sm">Produtos Avaliados</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-foreground md:text-3xl">{formatNumber(stats.totalCliques)}</span>
              <span className="mt-1 text-xs text-muted-foreground md:text-sm">Usuarios Ativos</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-foreground md:text-3xl">{stats.linksValidados}%</span>
              </div>
              <span className="mt-1 text-xs text-muted-foreground md:text-sm">Links Validados</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
