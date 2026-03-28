"use client"

import { useState, useEffect, useCallback, useRef } from "react"

// Gerar ou recuperar ID unico do usuario (armazenado no localStorage)
function getUsuarioId(): string {
  if (typeof window === "undefined") return ""
  
  let usuarioId = localStorage.getItem("sgc_usuario_id")
  if (!usuarioId) {
    usuarioId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    localStorage.setItem("sgc_usuario_id", usuarioId)
  }
  return usuarioId
}

interface ProdutoSalvo {
  id: number
  produto_id: string
  loja_id: string | null
  data_salvo: string
  produtos: {
    id: string
    nome: string
    descricao: string
    preco: number
    preco_original: number | null
    imagem_url: string
    link_afiliado: string
    lojas: { id: string; nome: string; icone: string | null } | null
  } | null
}

export function useSalvos() {
  const [salvos, setSalvos] = useState<ProdutoSalvo[]>([])
  const [salvosIds, setSalvosIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const usuarioIdRef = useRef<string>("")
  const [mounted, setMounted] = useState(false)

  // Carregar usuario ID no cliente
  useEffect(() => {
    const id = getUsuarioId()
    usuarioIdRef.current = id
    setMounted(true)
  }, [])

  // Carregar produtos salvos
  const carregarSalvos = useCallback(async () => {
    const uid = usuarioIdRef.current
    if (!uid) return
    
    try {
      const res = await fetch(`/api/salvos?usuario_id=${uid}`)
      if (res.ok) {
        const data = await res.json()
        setSalvos(data)
        setSalvosIds(new Set(data.map((s: ProdutoSalvo) => s.produto_id)))
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar salvos:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      carregarSalvos()
    }
  }, [mounted, carregarSalvos])

  // Verificar se produto esta salvo
  const isSalvo = useCallback((produtoId: string) => {
    return salvosIds.has(produtoId)
  }, [salvosIds])

  // Salvar produto
  const salvarProduto = useCallback(async (produtoId: string, lojaId?: string) => {
    const uid = usuarioIdRef.current
    if (!uid) {
      console.error("[v0] Usuario ID nao disponivel")
      return false
    }

    try {
      const res = await fetch("/api/salvos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: uid,
          produto_id: produtoId,
          loja_id: lojaId || null,
        }),
      })

      if (res.ok) {
        setSalvosIds((prev) => new Set([...prev, produtoId]))
        await carregarSalvos()
        return true
      } else {
        const errorData = await res.json()
        console.error("[v0] Erro na resposta:", errorData)
      }
    } catch (error) {
      console.error("[v0] Erro ao salvar produto:", error)
    }
    return false
  }, [carregarSalvos])

  // Remover produto salvo
  const removerSalvo = useCallback(async (produtoId: string) => {
    const uid = usuarioIdRef.current
    if (!uid) return false

    try {
      const res = await fetch(`/api/salvos?usuario_id=${uid}&produto_id=${produtoId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setSalvosIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(produtoId)
          return newSet
        })
        setSalvos((prev) => prev.filter((s) => s.produto_id !== produtoId))
        return true
      }
    } catch (error) {
      console.error("[v0] Erro ao remover salvo:", error)
    }
    return false
  }, [])

  // Toggle salvar/remover
  const toggleSalvo = useCallback(async (produtoId: string, lojaId?: string) => {
    if (isSalvo(produtoId)) {
      return await removerSalvo(produtoId)
    } else {
      return await salvarProduto(produtoId, lojaId)
    }
  }, [isSalvo, removerSalvo, salvarProduto])

  return {
    salvos,
    salvosIds,
    loading,
    isSalvo,
    salvarProduto,
    removerSalvo,
    toggleSalvo,
    totalSalvos: salvos.length,
  }
}
