"use client"

import { useEffect, useState } from "react"
import { Users, Star, Link2, PiggyBank } from "lucide-react"

interface Stats {
  totalCliques: number
  totalProdutos: number
  totalEconomia: number
  linksValidados: number
}

export function StatsFooter() {
  const [stats, setStats] = useState<Stats>({
    totalCliques: 0,
    totalProdutos: 0,
    totalEconomia: 0,
    linksValidados: 99.2,
  })

  useEffect(() => {
    fetch("/api/estatisticas")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const formatCurrency = (num: number) => {
    if (num >= 1000000) {
      return "R$ " + (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return "R$ " + (num / 1000).toFixed(1) + "K"
    }
    return "R$ " + num.toFixed(2).replace(".", ",")
  }

  return (
    <div className="border-t border-border bg-secondary/30 py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(stats.totalCliques)}+
            </div>
            <div className="text-xs text-muted-foreground">Usuarios confiam</div>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(stats.totalProdutos)}+
            </div>
            <div className="text-xs text-muted-foreground">Avaliacoes verificadas</div>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats.linksValidados}%
            </div>
            <div className="text-xs text-muted-foreground">Links validados</div>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <PiggyBank className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalEconomia)}
            </div>
            <div className="text-xs text-muted-foreground">Economizados</div>
          </div>
        </div>
      </div>
    </div>
  )
}
