"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Trash2, Plus, LogOut } from "lucide-react"

interface Loja {
  id: string
  nome: string
}

interface Cupom {
  id: string
  codigo: string
  descricao: string
}

interface Produto {
  id: string
  nome: string
  descricao: string
  imagem: string
  preco: number
  avaliacao: number
  loja_id: string | null
  cupom_id: string | null
  link_afiliado: string
  lojas: Loja | null
  cupons: Cupom | null
}

const emptyProduto = {
  nome: "",
  descricao: "",
  imagem: "",
  preco: 0,
  avaliacao: 0,
  loja_id: "",
  cupom_id: "",
  link_afiliado: "",
}

export default function AdminPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [lojas, setLojas] = useState<Loja[]>([])
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyProduto)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [produtosRes, lojasRes, cuponsRes] = await Promise.all([
        fetch("/api/admin/produtos"),
        fetch("/api/admin/lojas"),
        fetch("/api/admin/cupons"),
      ])

      if (produtosRes.status === 401) {
        router.push("/admin/login")
        return
      }

      const [produtosData, lojasData, cuponsData] = await Promise.all([
        produtosRes.json(),
        lojasRes.json(),
        cuponsRes.json(),
      ])

      setProdutos(produtosData)
      setLojas(lojasData)
      setCupons(cuponsData)
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

  function openNewDialog() {
    setEditingId(null)
    setForm(emptyProduto)
    setDialogOpen(true)
  }

  function openEditDialog(produto: Produto) {
    setEditingId(produto.id)
    setForm({
      nome: produto.nome,
      descricao: produto.descricao || "",
      imagem: produto.imagem || "",
      preco: produto.preco,
      avaliacao: produto.avaliacao || 0,
      loja_id: produto.loja_id || "",
      cupom_id: produto.cupom_id || "",
      link_afiliado: produto.link_afiliado || "",
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const url = editingId
        ? `/api/admin/produtos/${editingId}`
        : "/api/admin/produtos"
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          preco: Number(form.preco),
          avaliacao: Number(form.avaliacao),
          loja_id: form.loja_id || null,
          cupom_id: form.cupom_id || null,
        }),
      })

      if (res.ok) {
        setDialogOpen(false)
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

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    try {
      const res = await fetch(`/api/admin/produtos/${id}`, {
        method: "DELETE",
      })

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Painel Administrativo - Produtos</CardTitle>
            <div className="flex gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openNewDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingId ? "Editar Produto" : "Novo Produto"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={form.nome}
                        onChange={(e) =>
                          setForm({ ...form, nome: e.target.value })
                        }
                        placeholder="Nome do produto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={form.descricao}
                        onChange={(e) =>
                          setForm({ ...form, descricao: e.target.value })
                        }
                        placeholder="Descrição do produto"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imagem">URL da Imagem</Label>
                      <Input
                        id="imagem"
                        value={form.imagem}
                        onChange={(e) =>
                          setForm({ ...form, imagem: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preco">Preço (R$) *</Label>
                        <Input
                          id="preco"
                          type="number"
                          step="0.01"
                          value={form.preco}
                          onChange={(e) =>
                            setForm({ ...form, preco: Number(e.target.value) })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avaliacao">Avaliação (0-5)</Label>
                        <Input
                          id="avaliacao"
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={form.avaliacao}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              avaliacao: Number(e.target.value),
                            })
                          }
                          placeholder="4.5"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loja">Loja</Label>
                      <Select
                        value={form.loja_id}
                        onValueChange={(value) =>
                          setForm({ ...form, loja_id: value === "none" ? "" : value })
                        }
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
                      <Label htmlFor="cupom">Cupom</Label>
                      <Select
                        value={form.cupom_id}
                        onValueChange={(value) =>
                          setForm({ ...form, cupom_id: value === "none" ? "" : value })
                        }
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
                        value={form.link_afiliado}
                        onChange={(e) =>
                          setForm({ ...form, link_afiliado: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {produtos.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Nenhum produto cadastrado ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Avaliação</TableHead>
                      <TableHead>Loja</TableHead>
                      <TableHead>Cupom</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtos.map((produto) => (
                      <TableRow key={produto.id}>
                        <TableCell className="font-medium">
                          {produto.nome}
                        </TableCell>
                        <TableCell>
                          R$ {Number(produto.preco).toFixed(2)}
                        </TableCell>
                        <TableCell>{produto.avaliacao || "-"}</TableCell>
                        <TableCell>{produto.lojas?.nome || "-"}</TableCell>
                        <TableCell>{produto.cupons?.codigo || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(produto)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(produto.id)}
                            >
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
      </div>
    </div>
  )
}
