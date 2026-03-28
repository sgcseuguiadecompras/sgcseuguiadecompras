"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Trash2, Plus, LogOut, Package, Tag, Store, Home, Ticket, MessageSquare, Palette, Share2, ChevronUp, ChevronDown } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface Loja {
  id: string
  nome: string
  icone?: string
}

interface Cupom {
  id: string
  codigo: string
  descricao: string
  validade: string | null
  link: string | null
  loja_id: string | null
  lojas: Loja | null
}

interface Categoria {
  id: string
  nome: string
  slug: string
  icone: string | null
}

interface Produto {
  id: string
  nome: string
  descricao: string
  imagem: string[] | string | null
  preco: number
  avaliacao: number
  loja_id: string | null
  cupom_id: string | null
  link_afiliado: string
  lojas: Loja | null
  cupons: Cupom | null
  categorias: Categoria[]
}

interface Feedback {
  id: number
  mensagem: string
  usuario_id: string | null
  created_at: string
}

interface Tema {
  cor_primaria: string
  cor_fundo: string
  fonte_padrao: string
  layout_produtos: string
}

interface RedeSocial {
  id: string
  nome: string
  icone: string
  url: string
  posicao: string
  ativo: boolean
  ordem: number
}

const emptyProduto = {
  nome: "",
  descricao: "",
  imagens: [""] as string[],
  preco: 0,
  avaliacao: 0,
  loja_id: "",
  cupom_id: "",
  link_afiliado: "",
  categoria_ids: [] as string[],
}

const emptyCategoria = { nome: "", icone: "" }
const emptyLoja = { nome: "", icone: "" }
const emptyCupom = { codigo: "", descricao: "", validade: "", link: "", loja_id: "" }
const emptyRedeSocial = { nome: "", icone: "", url: "", posicao: "rodape", ativo: true, ordem: 0 }

export default function AdminPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [lojas, setLojas] = useState<Loja[]>([])
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [redesSociais, setRedesSociais] = useState<RedeSocial[]>([])
  const [tema, setTema] = useState<Tema>({
    cor_primaria: "#000000",
    cor_fundo: "#FFFFFF",
    fonte_padrao: "Inter",
    layout_produtos: "grid",
  })
  const [temaSaving, setTemaSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Dialogs
  const [produtoDialogOpen, setProdutoDialogOpen] = useState(false)
  const [categoriaDialogOpen, setCategoriaDialogOpen] = useState(false)
  const [lojaDialogOpen, setLojaDialogOpen] = useState(false)
  const [cupomDialogOpen, setCupomDialogOpen] = useState(false)
  const [redeDialogOpen, setRedeDialogOpen] = useState(false)
  
  // Editing IDs
  const [editingProdutoId, setEditingProdutoId] = useState<string | null>(null)
  const [editingCategoriaId, setEditingCategoriaId] = useState<string | null>(null)
  const [editingLojaId, setEditingLojaId] = useState<string | null>(null)
  const [editingCupomId, setEditingCupomId] = useState<string | null>(null)
  const [editingRedeId, setEditingRedeId] = useState<string | null>(null)
  
  // Forms
  const [produtoForm, setProdutoForm] = useState(emptyProduto)
  const [categoriaForm, setCategoriaForm] = useState(emptyCategoria)
  const [lojaForm, setLojaForm] = useState(emptyLoja)
  const [cupomForm, setCupomForm] = useState(emptyCupom)
  const [redeForm, setRedeForm] = useState(emptyRedeSocial)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [produtosRes, lojasRes, cuponsRes, categoriasRes, feedbacksRes, temaRes, redesRes] = await Promise.all([
        fetch("/api/admin/produtos"),
        fetch("/api/admin/lojas"),
        fetch("/api/admin/cupons"),
        fetch("/api/admin/categorias"),
        fetch("/api/feedbacks"),
        fetch("/api/admin/tema"),
        fetch("/api/admin/redes-sociais"),
      ])

      if (produtosRes.status === 401) {
        router.push("/admin/login")
        return
      }

      const [produtosData, lojasData, cuponsData, categoriasData, feedbacksData, temaData, redesData] = await Promise.all([
        produtosRes.json(),
        lojasRes.json(),
        cuponsRes.json(),
        categoriasRes.json(),
        feedbacksRes.json(),
        temaRes.json(),
        redesRes.json(),
      ])

      setProdutos(produtosData)
      setLojas(lojasData)
      setCupons(cuponsData)
      setCategorias(categoriasData)
      setFeedbacks(Array.isArray(feedbacksData) ? feedbacksData : [])
      if (temaData) setTema(temaData)
      setRedesSociais(Array.isArray(redesData) ? redesData : [])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" })
    router.push("/admin/login")
  }

  // Produto handlers
  function openNewProdutoDialog() {
    setEditingProdutoId(null)
    setProdutoForm(emptyProduto)
    setProdutoDialogOpen(true)
  }

  function openEditProdutoDialog(produto: Produto) {
    setEditingProdutoId(produto.id)
    // Converter imagem para array se necessário
    let imagens: string[] = [""]
    if (Array.isArray(produto.imagem)) {
      imagens = produto.imagem.length > 0 ? produto.imagem : [""]
    } else if (typeof produto.imagem === "string" && produto.imagem) {
      imagens = [produto.imagem]
    }
    setProdutoForm({
      nome: produto.nome,
      descricao: produto.descricao || "",
      imagens,
      preco: produto.preco,
      avaliacao: produto.avaliacao || 0,
      loja_id: produto.loja_id || "",
      cupom_id: produto.cupom_id || "",
      link_afiliado: produto.link_afiliado || "",
      categoria_ids: produto.categorias?.map(c => c.id) || [],
    })
    setProdutoDialogOpen(true)
  }

  async function handleSaveProduto() {
    setSaving(true)
    try {
      const url = editingProdutoId
        ? `/api/admin/produtos/${editingProdutoId}`
        : "/api/admin/produtos"
      const method = editingProdutoId ? "PUT" : "POST"

      // Filtrar imagens vazias
      const imagensFiltradas = produtoForm.imagens.filter(img => img.trim() !== "")
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...produtoForm,
          imagem: imagensFiltradas,
          preco: Number(produtoForm.preco),
          avaliacao: Number(produtoForm.avaliacao),
          loja_id: produtoForm.loja_id || null,
          cupom_id: produtoForm.cupom_id || null,
        }),
      })

      if (res.ok) {
        setProdutoDialogOpen(false)
        loadData()
      } else {
        const error = await res.json()
        alert("Erro: " + error.error)
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar produto")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteProduto(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    try {
      const res = await fetch(`/api/admin/produtos/${id}`, { method: "DELETE" })
      if (res.ok) {
        loadData()
      } else {
        const error = await res.json()
        alert("Erro: " + error.error)
      }
    } catch (error) {
      console.error("Erro ao excluir:", error)
      alert("Erro ao excluir produto")
    }
  }

  // Categoria handlers
  function openNewCategoriaDialog() {
    setEditingCategoriaId(null)
    setCategoriaForm(emptyCategoria)
    setCategoriaDialogOpen(true)
  }

  function openEditCategoriaDialog(categoria: Categoria) {
    setEditingCategoriaId(categoria.id)
    setCategoriaForm({ nome: categoria.nome, icone: categoria.icone || "" })
    setCategoriaDialogOpen(true)
  }

  async function handleSaveCategoria() {
    setSaving(true)
    try {
      const url = editingCategoriaId
        ? `/api/admin/categorias/${editingCategoriaId}`
        : "/api/admin/categorias"
      const method = editingCategoriaId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoriaForm),
      })

      if (res.ok) {
        setCategoriaDialogOpen(false)
        loadData()
      } else {
        const error = await res.json()
        alert("Erro: " + error.error)
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar categoria")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteCategoria(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return

    try {
      const res = await fetch(`/api/admin/categorias/${id}`, { method: "DELETE" })
      if (res.ok) {
        loadData()
      } else {
        const error = await res.json()
        alert("Erro: " + error.error)
      }
    } catch (error) {
      console.error("Erro ao excluir:", error)
      alert("Erro ao excluir categoria")
    }
  }

  // Loja handlers
  function openNewLojaDialog() {
    setEditingLojaId(null)
    setLojaForm(emptyLoja)
    setLojaDialogOpen(true)
  }

  function openEditLojaDialog(loja: Loja) {
    setEditingLojaId(loja.id)
    setLojaForm({ nome: loja.nome, icone: loja.icone || "" })
    setLojaDialogOpen(true)
  }

  async function handleSaveLoja() {
    setSaving(true)
    try {
      const url = editingLojaId
        ? `/api/admin/lojas/${editingLojaId}`
        : "/api/admin/lojas"
      const method = editingLojaId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lojaForm),
      })

      if (res.ok) {
        setLojaDialogOpen(false)
        loadData()
      } else {
        const error = await res.json()
        alert("Erro: " + error.error)
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar loja")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteLoja(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta loja?")) return

    try {
      const res = await fetch(`/api/admin/lojas/${id}`, { method: "DELETE" })
      if (res.ok) {
        loadData()
      } else {
        const error = await res.json()
        alert("Erro: " + error.error)
      }
    } catch (error) {
      console.error("Erro ao excluir:", error)
      alert("Erro ao excluir loja")
    }
  }

  // Cupom handlers
  function openNewCupomDialog() {
    setEditingCupomId(null)
    setCupomForm(emptyCupom)
    setCupomDialogOpen(true)
  }

  function openEditCupomDialog(cupom: Cupom) {
    setEditingCupomId(cupom.id)
    setCupomForm({
      codigo: cupom.codigo,
      descricao: cupom.descricao || "",
      validade: cupom.validade ? cupom.validade.split("T")[0] : "",
      link: cupom.link || "",
      loja_id: cupom.loja_id || "",
    })
    setCupomDialogOpen(true)
  }

  async function handleSaveCupom() {
    setSaving(true)
    try {
      const url = editingCupomId
        ? `/api/admin/cupons/${editingCupomId}`
        : "/api/admin/cupons"
      const method = editingCupomId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cupomForm,
          validade: cupomForm.validade || null,
          link: cupomForm.link || null,
          loja_id: cupomForm.loja_id || null,
        }),
      })

      if (res.ok) {
        setCupomDialogOpen(false)
        loadData()
      } else {
        const error = await res.json()
        alert("Erro: " + error.error)
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar cupom")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteCupom(id: string) {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return

    try {
      const res = await fetch(`/api/admin/cupons/${id}`, { method: "DELETE" })
      if (res.ok) {
        loadData()
      } else {
        const error = await res.json()
        alert("Erro: " + error.error)
      }
    } catch (error) {
      console.error("Erro ao excluir:", error)
      alert("Erro ao excluir cupom")
    }
  }

  async function handleSaveTema() {
    setTemaSaving(true)
    try {
      const res = await fetch("/api/admin/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tema),
      })

      if (res.ok) {
        alert("Tema salvo com sucesso!")
      } else {
        const error = await res.json()
        alert("Erro: " + error.error)
      }
    } catch (error) {
      console.error("Erro ao salvar tema:", error)
      alert("Erro ao salvar tema")
    } finally {
      setTemaSaving(false)
    }
  }

  // Rede Social handlers
  function openNewRedeDialog() {
    setEditingRedeId(null)
    setRedeForm(emptyRedeSocial)
    setRedeDialogOpen(true)
  }

  function openEditRedeDialog(rede: RedeSocial) {
    setEditingRedeId(rede.id)
    setRedeForm({
      nome: rede.nome,
      icone: rede.icone,
      url: rede.url,
      posicao: rede.posicao,
      ativo: rede.ativo,
      ordem: rede.ordem,
    })
    setRedeDialogOpen(true)
  }

  async function handleSaveRede() {
    setSaving(true)
    try {
      const url = editingRedeId
        ? `/api/admin/redes-sociais/${editingRedeId}`
        : "/api/admin/redes-sociais"
      const method = editingRedeId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(redeForm),
      })

      if (res.ok) {
        setRedeDialogOpen(false)
        loadData()
      } else {
        const error = await res.json()
        alert("Erro: " + error.error)
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar rede social")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteRede(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta rede social?")) return

    try {
      const res = await fetch(`/api/admin/redes-sociais/${id}`, { method: "DELETE" })
      if (res.ok) {
        loadData()
      } else {
        const error = await res.json()
        alert("Erro: " + error.error)
      }
    } catch (error) {
      console.error("Erro ao excluir:", error)
      alert("Erro ao excluir rede social")
    }
  }

  async function moveRede(id: string, direction: "up" | "down") {
    const index = redesSociais.findIndex(r => r.id === id)
    if (index === -1) return
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === redesSociais.length - 1) return

    const newOrder = [...redesSociais]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    
    // Swap orders
    const tempOrdem = newOrder[index].ordem
    newOrder[index].ordem = newOrder[swapIndex].ordem
    newOrder[swapIndex].ordem = tempOrdem

    // Update both items
    try {
      await Promise.all([
        fetch(`/api/admin/redes-sociais/${newOrder[index].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newOrder[index]),
        }),
        fetch(`/api/admin/redes-sociais/${newOrder[swapIndex].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newOrder[swapIndex]),
        }),
      ])
      loadData()
    } catch (error) {
      console.error("Erro ao reordenar:", error)
    }
  }

  function toggleCategoria(catId: string) {
    setProdutoForm(prev => ({
      ...prev,
      categoria_ids: prev.categoria_ids.includes(catId)
        ? prev.categoria_ids.filter(id => id !== catId)
        : [...prev.categoria_ids, catId]
    }))
  }

  // Funções para gerenciar múltiplas imagens
  function addImageField() {
    setProdutoForm(prev => ({
      ...prev,
      imagens: [...prev.imagens, ""]
    }))
  }

  function removeImageField(index: number) {
    setProdutoForm(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index)
    }))
  }

  function updateImageField(index: number, value: string) {
    setProdutoForm(prev => ({
      ...prev,
      imagens: prev.imagens.map((img, i) => i === index ? value : img)
    }))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xl font-bold text-foreground">
              SGC Admin
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                Inicio
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/#categorias" target="_blank" rel="noopener noreferrer">
                Categorias
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/#produtos" target="_blank" rel="noopener noreferrer">
                Produtos
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/#cupons" target="_blank" rel="noopener noreferrer">
                Cupons
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        <Tabs defaultValue="produtos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="produtos" className="gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="categorias" className="gap-2">
              <Tag className="h-4 w-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="lojas" className="gap-2">
              <Store className="h-4 w-4" />
              Lojas
            </TabsTrigger>
            <TabsTrigger value="cupons" className="gap-2">
              <Ticket className="h-4 w-4" />
              Cupons
            </TabsTrigger>
            <TabsTrigger value="feedbacks" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedbacks
            </TabsTrigger>
            <TabsTrigger value="tema" className="gap-2">
              <Palette className="h-4 w-4" />
              Tema
            </TabsTrigger>
            <TabsTrigger value="redes" className="gap-2">
              <Share2 className="h-4 w-4" />
              Redes Sociais
            </TabsTrigger>
          </TabsList>

          {/* Produtos Tab */}
          <TabsContent value="produtos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Produtos ({produtos.length})</CardTitle>
                <Button onClick={openNewProdutoDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </CardHeader>
              <CardContent>
                {produtos.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Nenhum produto cadastrado.
                  </p>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Preco</TableHead>
                          <TableHead>Loja</TableHead>
                          <TableHead>Categorias</TableHead>
                          <TableHead className="text-right">Acoes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {produtos.map((produto) => (
                          <TableRow key={produto.id}>
                            <TableCell className="font-medium">{produto.nome}</TableCell>
                            <TableCell>R$ {Number(produto.preco).toFixed(2)}</TableCell>
                            <TableCell>{produto.lojas?.nome || "-"}</TableCell>
                            <TableCell>
                              {produto.categorias?.map(c => c.nome).join(", ") || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditProdutoDialog(produto)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteProduto(produto.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categorias Tab */}
          <TabsContent value="categorias">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Categorias ({categorias.length})</CardTitle>
                <Button onClick={openNewCategoriaDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Categoria
                </Button>
              </CardHeader>
              <CardContent>
                {categorias.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Nenhuma categoria cadastrada.
                  </p>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead className="text-right">Acoes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categorias.map((categoria) => (
                          <TableRow key={categoria.id}>
                            <TableCell className="font-medium">{categoria.nome}</TableCell>
                            <TableCell className="text-muted-foreground">{categoria.slug}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditCategoriaDialog(categoria)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCategoria(categoria.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lojas Tab */}
          <TabsContent value="lojas">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lojas ({lojas.length})</CardTitle>
                <Button onClick={openNewLojaDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Loja
                </Button>
              </CardHeader>
              <CardContent>
                {lojas.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Nenhuma loja cadastrada.
                  </p>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Icone</TableHead>
                          <TableHead className="text-right">Acoes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lojas.map((loja) => (
                          <TableRow key={loja.id}>
                            <TableCell className="font-medium">{loja.nome}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {loja.icone ? (
                                <img src={loja.icone} alt={loja.nome} className="h-6 w-6 object-contain" />
                              ) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditLojaDialog(loja)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteLoja(loja.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cupons Tab */}
          <TabsContent value="cupons">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cupons ({cupons.length})</CardTitle>
                <Button onClick={openNewCupomDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cupom
                </Button>
              </CardHeader>
              <CardContent>
                {cupons.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Nenhum cupom cadastrado.
                  </p>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead>Codigo</TableHead>
                          <TableHead>Descricao</TableHead>
                          <TableHead>Validade</TableHead>
                          <TableHead className="text-right">Acoes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cupons.map((cupom) => (
                          <TableRow key={cupom.id}>
                            <TableCell className="font-medium font-mono">{cupom.codigo}</TableCell>
                            <TableCell>{cupom.descricao || "-"}</TableCell>
                            <TableCell>
                              {cupom.validade
                                ? new Date(cupom.validade).toLocaleDateString("pt-BR")
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditCupomDialog(cupom)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCupom(cupom.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedbacks Tab */}
          <TabsContent value="feedbacks">
            <Card>
              <CardHeader>
                <CardTitle>Feedbacks e Sugestões ({feedbacks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {feedbacks.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Nenhum feedback recebido ainda.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="rounded-lg border border-border bg-muted/30 p-4"
                      >
                        <p className="whitespace-pre-line text-sm text-foreground">
                          {feedback.mensagem}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {new Date(feedback.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {feedback.usuario_id && (
                            <span className="truncate max-w-[200px]">
                              ID: {feedback.usuario_id.slice(0, 20)}...
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tema Tab */}
          <TabsContent value="tema">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Tema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cor-primaria">Cor Primária</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        id="cor-primaria"
                        value={tema.cor_primaria}
                        onChange={(e) => setTema({ ...tema, cor_primaria: e.target.value })}
                        className="h-10 w-16 cursor-pointer rounded border"
                      />
                      <Input
                        value={tema.cor_primaria}
                        onChange={(e) => setTema({ ...tema, cor_primaria: e.target.value })}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cor-fundo">Cor de Fundo</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        id="cor-fundo"
                        value={tema.cor_fundo}
                        onChange={(e) => setTema({ ...tema, cor_fundo: e.target.value })}
                        className="h-10 w-16 cursor-pointer rounded border"
                      />
                      <Input
                        value={tema.cor_fundo}
                        onChange={(e) => setTema({ ...tema, cor_fundo: e.target.value })}
                        placeholder="#FFFFFF"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fonte">Fonte Padrão</Label>
                    <Select
                      value={tema.fonte_padrao}
                      onValueChange={(value) => setTema({ ...tema, fonte_padrao: value })}
                    >
                      <SelectTrigger id="fonte">
                        <SelectValue placeholder="Selecione uma fonte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="DM Sans">DM Sans</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="layout">Layout de Produtos</Label>
                    <Select
                      value={tema.layout_produtos}
                      onValueChange={(value) => setTema({ ...tema, layout_produtos: value })}
                    >
                      <SelectTrigger id="layout">
                        <SelectValue placeholder="Selecione um layout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grade (Grid)</SelectItem>
                        <SelectItem value="list">Lista</SelectItem>
                        <SelectItem value="carousel">Carrossel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveTema} disabled={temaSaving}>
                    {temaSaving ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </div>

                {/* Preview */}
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 text-sm font-medium">Pré-visualização</h4>
                  <div
                    className="rounded-lg p-4"
                    style={{ backgroundColor: tema.cor_fundo }}
                  >
                    <div
                      className="inline-block rounded px-4 py-2 text-white"
                      style={{ backgroundColor: tema.cor_primaria, fontFamily: tema.fonte_padrao }}
                    >
                      Botão de Exemplo
                    </div>
                    <p
                      className="mt-2 text-sm"
                      style={{ fontFamily: tema.fonte_padrao }}
                    >
                      Texto de exemplo com a fonte {tema.fonte_padrao}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redes Sociais Tab */}
          <TabsContent value="redes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Redes Sociais ({redesSociais.length})</CardTitle>
                <Button onClick={openNewRedeDialog} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                {redesSociais.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Nenhuma rede social cadastrada.
                  </p>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead>Ordem</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Icone</TableHead>
                          <TableHead>Posicao</TableHead>
                          <TableHead>Ativo</TableHead>
                          <TableHead className="text-right">Acoes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {redesSociais.map((rede, index) => (
                          <TableRow key={rede.id}>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => moveRede(rede.id, "up")}
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => moveRede(rede.id, "down")}
                                  disabled={index === redesSociais.length - 1}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{rede.nome}</TableCell>
                            <TableCell>
                              {rede.icone?.startsWith("http") ? (
                                <img src={rede.icone} alt={rede.nome} className="h-6 w-6" />
                              ) : (
                                <span className="text-sm text-muted-foreground">{rede.icone}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="rounded bg-muted px-2 py-1 text-xs capitalize">
                                {rede.posicao}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`rounded px-2 py-1 text-xs ${rede.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {rede.ativo ? "Sim" : "Nao"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditRedeDialog(rede)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteRede(rede.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Produto Dialog */}
        <Dialog open={produtoDialogOpen} onOpenChange={setProdutoDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingProdutoId ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={produtoForm.nome}
                  onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
                  placeholder="Nome do produto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descricao</Label>
                <Textarea
                  id="descricao"
                  value={produtoForm.descricao}
                  onChange={(e) => setProdutoForm({ ...produtoForm, descricao: e.target.value })}
                  placeholder="Descricao do produto"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Imagens</Label>
                <div className="space-y-2">
                  {produtoForm.imagens.map((img, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={img}
                        onChange={(e) => updateImageField(index, e.target.value)}
                        placeholder="https://..."
                      />
                      {produtoForm.imagens.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeImageField(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageField}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar outra imagem
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco">Preco (R$) *</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={produtoForm.preco}
                    onChange={(e) => setProdutoForm({ ...produtoForm, preco: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avaliacao">Avaliacao (0-5)</Label>
                  <Input
                    id="avaliacao"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={produtoForm.avaliacao}
                    onChange={(e) => setProdutoForm({ ...produtoForm, avaliacao: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loja">Loja</Label>
                <Select
                  value={produtoForm.loja_id}
                  onValueChange={(value) => setProdutoForm({ ...produtoForm, loja_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma loja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {lojas.map((loja) => (
                      <SelectItem key={loja.id} value={loja.id}>
                        {loja.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categorias</Label>
                <div className="max-h-32 overflow-y-auto rounded-md border p-3">
                  {categorias.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada</p>
                  ) : (
                    <div className="space-y-2">
                      {categorias.map((cat) => (
                        <div key={cat.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cat-${cat.id}`}
                            checked={produtoForm.categoria_ids.includes(cat.id)}
                            onCheckedChange={() => toggleCategoria(cat.id)}
                          />
                          <label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">
                            {cat.nome}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cupom">Cupom</Label>
                <Select
                  value={produtoForm.cupom_id}
                  onValueChange={(value) => setProdutoForm({ ...produtoForm, cupom_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cupom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {cupons.map((cupom) => (
                      <SelectItem key={cupom.id} value={cupom.id}>
                        {cupom.codigo} - {cupom.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="link_afiliado">Link de Afiliado</Label>
                <Input
                  id="link_afiliado"
                  value={produtoForm.link_afiliado}
                  onChange={(e) => setProdutoForm({ ...produtoForm, link_afiliado: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setProdutoDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProduto} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Categoria Dialog */}
        <Dialog open={categoriaDialogOpen} onOpenChange={setCategoriaDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategoriaId ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cat-nome">Nome *</Label>
                <Input
                  id="cat-nome"
                  value={categoriaForm.nome}
                  onChange={(e) => setCategoriaForm({ ...categoriaForm, nome: e.target.value })}
                  placeholder="Nome da categoria"
                />
                <p className="text-xs text-muted-foreground">
                  O slug sera gerado automaticamente a partir do nome.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-icone">URL do Icone (opcional)</Label>
                <Input
                  id="cat-icone"
                  value={categoriaForm.icone}
                  onChange={(e) => setCategoriaForm({ ...categoriaForm, icone: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCategoriaDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveCategoria} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loja Dialog */}
        <Dialog open={lojaDialogOpen} onOpenChange={setLojaDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingLojaId ? "Editar Loja" : "Nova Loja"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="loja-nome">Nome *</Label>
                <Input
                  id="loja-nome"
                  value={lojaForm.nome}
                  onChange={(e) => setLojaForm({ ...lojaForm, nome: e.target.value })}
                  placeholder="Nome da loja"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loja-icone">URL do Icone (opcional)</Label>
                <Input
                  id="loja-icone"
                  value={lojaForm.icone}
                  onChange={(e) => setLojaForm({ ...lojaForm, icone: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setLojaDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveLoja} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cupom Dialog */}
        <Dialog open={cupomDialogOpen} onOpenChange={setCupomDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCupomId ? "Editar Cupom" : "Novo Cupom"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cupom-loja">Loja (opcional)</Label>
                <Select
                  value={cupomForm.loja_id || "none"}
                  onValueChange={(value) => setCupomForm({ ...cupomForm, loja_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger id="cupom-loja">
                    <SelectValue placeholder="Selecione uma loja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma loja</SelectItem>
                    {lojas.map((loja) => (
                      <SelectItem key={loja.id} value={loja.id}>
                        {loja.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cupom-codigo">Codigo *</Label>
                <Input
                  id="cupom-codigo"
                  value={cupomForm.codigo}
                  onChange={(e) => setCupomForm({ ...cupomForm, codigo: e.target.value.toUpperCase() })}
                  placeholder="DESCONTO10"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cupom-descricao">Descricao</Label>
                <Textarea
                  id="cupom-descricao"
                  value={cupomForm.descricao}
                  onChange={(e) => setCupomForm({ ...cupomForm, descricao: e.target.value })}
                  placeholder="10% de desconto em toda a loja"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cupom-validade">Validade (opcional)</Label>
                <Input
                  id="cupom-validade"
                  type="date"
                  value={cupomForm.validade}
                  onChange={(e) => setCupomForm({ ...cupomForm, validade: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cupom-link">Link da oferta (opcional)</Label>
                <Input
                  id="cupom-link"
                  value={cupomForm.link}
                  onChange={(e) => setCupomForm({ ...cupomForm, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCupomDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveCupom} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Rede Social Dialog */}
        <Dialog open={redeDialogOpen} onOpenChange={setRedeDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingRedeId ? "Editar Rede Social" : "Nova Rede Social"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rede-nome">Nome</Label>
                <Input
                  id="rede-nome"
                  value={redeForm.nome}
                  onChange={(e) => setRedeForm({ ...redeForm, nome: e.target.value })}
                  placeholder="Instagram"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rede-icone">Icone (URL ou classe CSS)</Label>
                <Input
                  id="rede-icone"
                  value={redeForm.icone}
                  onChange={(e) => setRedeForm({ ...redeForm, icone: e.target.value })}
                  placeholder="https://... ou lucide:instagram"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rede-url">URL</Label>
                <Input
                  id="rede-url"
                  value={redeForm.url}
                  onChange={(e) => setRedeForm({ ...redeForm, url: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rede-posicao">Posicao</Label>
                <Select
                  value={redeForm.posicao}
                  onValueChange={(value) => setRedeForm({ ...redeForm, posicao: value })}
                >
                  <SelectTrigger id="rede-posicao">
                    <SelectValue placeholder="Selecione a posicao" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rodape">Rodape</SelectItem>
                    <SelectItem value="lateral">Lateral</SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="rede-ativo"
                  checked={redeForm.ativo}
                  onCheckedChange={(checked) => setRedeForm({ ...redeForm, ativo: checked })}
                />
                <Label htmlFor="rede-ativo">Ativo</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setRedeDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveRede} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
