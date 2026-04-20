"use client"

import { createContext, useContext, ReactNode } from "react"
import { useSalvos } from "@/hooks/use-salvos"

interface SalvosContextType {
  salvos: ReturnType<typeof useSalvos>["salvos"]
  salvosIds: ReturnType<typeof useSalvos>["salvosIds"]
  loading: boolean
  isSalvo: (produtoId: string) => boolean
  salvarProduto: (produtoId: string, lojaId?: string) => Promise<boolean>
  removerSalvo: (produtoId: string) => Promise<boolean>
  toggleSalvo: (produtoId: string, lojaId?: string) => Promise<boolean>
  totalSalvos: number
}

const SalvosContext = createContext<SalvosContextType | null>(null)

export function SalvosProvider({ children }: { children: ReactNode }) {
  const salvosData = useSalvos()

  return (
    <SalvosContext.Provider value={salvosData}>
      {children}
    </SalvosContext.Provider>
  )
}

export function useSalvosContext() {
  const context = useContext(SalvosContext)
  if (!context) {
    throw new Error("useSalvosContext deve ser usado dentro de SalvosProvider")
  }
  return context
}
