"use client"

import Link from "next/link"
import { Heart, Star, ExternalLink, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSalvosContext } from "@/contexts/salvos-context"

export function SalvosClient() {
  const { salvos, loading, removerSalvo } = useSalvosContext()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (salvos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <Heart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Nenhum produto salvo</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Clique no icone de coracao nos produtos para salva-los aqui e comprar depois.
        </p>
        <Button asChild className="mt-6">
          <Link href="/#produtos">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Ver Produtos
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {salvos.map((item) => {
        const produto = item.produtos
        if (!produto) return null

        return (
          <div
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
          >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-secondary">
              {produto.imagem && produto.imagem.length > 0 ? (
                <img
                  src={produto.imagem[0]}
                  alt={produto.nome}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Star className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removerSalvo(produto.id)}
                className="absolute right-2 top-2 h-8 w-8 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                aria-label="Remover dos salvos"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {produto.lojas && (
                <Badge variant="outline" className="absolute left-2 top-2 border-border bg-card/80 backdrop-blur-sm">
                  {produto.lojas.nome}
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                {produto.nome}
              </h3>
              
              {produto.descricao && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {produto.descricao}
                </p>
              )}

              {/* Price and Rating */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">
                  R$ {(produto.preco || 0).toFixed(2).replace(".", ",")}
                </span>
                {produto.avaliacao && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm text-muted-foreground">{produto.avaliacao}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                {produto.link_afiliado && (
                  <Button size="sm" className="flex-1 gap-1" asChild>
                    <a href={produto.link_afiliado} target="_blank" rel="noopener noreferrer">
                      Ver Oferta
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
