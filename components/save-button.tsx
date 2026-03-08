"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSalvosContext } from "@/contexts/salvos-context"
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
  const salvo = isSalvo(produtoId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleSalvo(produtoId, lojaId)
  }

  if (variant === "full") {
    return (
      <Button
        variant={salvo ? "default" : "outline"}
        size={size}
        onClick={handleClick}
        className={cn("gap-1.5", className)}
      >
        <Heart className={cn("h-4 w-4", salvo && "fill-current")} />
        {salvo ? "Salvo" : "Salvar"}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn(
        "h-8 w-8 rounded-full",
        salvo 
          ? "bg-primary/10 text-primary hover:bg-primary/20" 
          : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground",
        className
      )}
      aria-label={salvo ? "Remover dos salvos" : "Salvar produto"}
    >
      <Heart className={cn("h-4 w-4", salvo && "fill-current")} />
    </Button>
  )
}
