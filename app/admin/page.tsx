import Link from "next/link"
import { 
  Package, 
  Tag, 
  Link2, 
  Store, 
  MessageSquare, 
  BarChart3,
  Plus,
  ArrowLeft,
  Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { productRepository, couponRepository, storeRepository, reviewRepository, categoryRepository } from "@/lib/db"

export default async function AdminPage() {
  // Buscar estatísticas
  const products = await productRepository.getFeaturedProducts(100)
  const coupons = await couponRepository.getActiveCoupons(100)
  const stores = await storeRepository.getActiveStores()
  const categories = await categoryRepository.getActiveCategories()
  
  // Calcular métricas
  const totalProducts = products.length
  const totalCoupons = coupons.length
  const totalStores = stores.length
  const totalCategories = categories.length
  const totalClicks = products.reduce((acc, p) => acc + (p.clickCount || 0), 0)

  const stats = [
    { label: "Produtos", value: totalProducts, icon: Package, color: "text-blue-500" },
    { label: "Cupons Ativos", value: totalCoupons, icon: Tag, color: "text-green-500" },
    { label: "Lojas", value: totalStores, icon: Store, color: "text-purple-500" },
    { label: "Categorias", value: totalCategories, icon: Database, color: "text-orange-500" },
    { label: "Cliques Totais", value: totalClicks.toLocaleString("pt-BR"), icon: BarChart3, color: "text-pink-500" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">SGC - Seu Guia de Compras</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          Versão 1.0
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg bg-muted p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Ações Rápidas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Plus className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-sm">Novo Produto</CardTitle>
                  <CardDescription className="text-xs">Adicionar produto ao catálogo</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <Tag className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-sm">Novo Cupom</CardTitle>
                  <CardDescription className="text-xs">Cadastrar cupom de desconto</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <Link2 className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-sm">Gerenciar Links</CardTitle>
                  <CardDescription className="text-xs">Links de afiliados</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-500/10 p-2">
                  <MessageSquare className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-sm">Reviews</CardTitle>
                  <CardDescription className="text-xs">Moderar avaliações</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Products List */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Produtos Recentes</h2>
          <Button variant="outline" size="sm">Ver todos</Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {(product.currentPrice || 0).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.isFeatured ? "default" : "secondary"}>
                      {product.isFeatured ? "Destaque" : "Normal"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {product.clickCount || 0} cliques
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Cupons Ativos</h2>
          <Button variant="outline" size="sm">Ver todos</Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {coupons.slice(0, 5).map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <code className="rounded bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
                      {coupon.code}
                    </code>
                    <div>
                      <p className="font-medium text-foreground">{coupon.description}</p>
                      <p className="text-sm text-muted-foreground">{coupon.store?.name || "Loja"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{coupon.discountText}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {coupon.usageCount} usos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/50 p-4">
        <p className="text-center text-sm text-muted-foreground">
          Para funcionalidades completas de CRUD, conecte um banco de dados (Supabase, Neon, etc.) 
          através das integrações do v0.
        </p>
      </div>
    </div>
  )
}
