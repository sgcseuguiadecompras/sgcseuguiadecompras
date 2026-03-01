"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import type { ProductWithRelations } from "@/lib/db"

function BuscaContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchTerm, setSearchTerm] = useState(query)
  const [results, setResults] = useState<ProductWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (query) {
      setSearchTerm(query)
      performSearch(query)
    }
  }, [query])

  async function performSearch(term: string) {
    if (!term.trim()) return
    
    setLoading(true)
    setSearched(true)
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`)
      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error("Erro na busca:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    performSearch(searchTerm)
    // Atualizar URL
    const url = new URL(window.location.href)
    url.searchParams.set("q", searchTerm)
    window.history.pushState({}, "", url.toString())
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Buscar Produtos</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Digite o que voce procura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Buscar"
          )}
        </Button>
      </form>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            Nenhum produto encontrado para &quot;{query || searchTerm}&quot;
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tente buscar por outros termos
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {results.length} produto(s) encontrado(s) para &quot;{query || searchTerm}&quot;
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}

      {!searched && (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg text-muted-foreground">
            Digite acima para buscar produtos
          </p>
        </div>
      )}
    </div>
  )
}

export default function BuscaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <BuscaContent />
    </Suspense>
  )
}
