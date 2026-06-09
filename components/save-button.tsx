"use client"

import { useState } from "react"
import { Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSalvosContext } from "@/contexts/salvos-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SaveButtonProps {
  produtoId: string
  lojaId?: string
  variant?: "icon" | "full"
  size?: "sm" | "default"
  className?: string
}

export function SaveButton({ 
  produtoId, 
  lojaId, 
  variant = "icon", 
  size = "sm",
  className 
}: SaveButtonProps) {
  const { isSalvo, toggleSalvo } = useSalvosContext()
  const [saving, setSaving] = useState(false)
  const salvo = isSalvo(produtoId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setSaving(true)
    try {
      const success = await toggleSalvo(produtoId, lojaId)
      if (success) {
        if (salvo) {
          toast.success("Produto removido dos salvos")
        } else {
          toast.success("Produto salvo com sucesso!")
        }
      } else {
        toast.error("Erro ao salvar produto")
      }
    } catch {
      toast.error("Erro ao processar")
    } finally {
      setSaving(false)
    }
  }

  if (variant === "full") {
    return (
      <Button
        variant={salvo ? "default" : "outline"}
        size={size}
        onClick={handleClick}
        disabled={saving}
        className={cn("gap-1.5", className)}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={cn("h-4 w-4", salvo && "fill-current")} />
        )}
        {salvo ? "Salvo" : "Salvar"}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={saving}
      className={cn(
        "h-8 w-8 rounded-full",
        salvo 
          ? "bg-primary/10 text-primary hover:bg-primary/20" 
          : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground",
        className
      )}
      aria-label={salvo ? "Remover dos salvos" : "Salvar produto"}
    >
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn("h-4 w-4", salvo && "fill-current")} />
      )}
    </Button>
  )
}
