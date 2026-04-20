"use client"

import { useState } from "react"
import { Send, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function FeedbackForm() {
  const [mensagem, setMensagem] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!mensagem.trim()) {
      toast.error("Digite sua sugestão")
      return
    }

    setSending(true)
    
    try {
      // Obter usuario_id do localStorage se existir
      const usuarioId = typeof window !== "undefined" 
        ? localStorage.getItem("sgc_usuario_id") 
        : null

      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem: mensagem.trim(),
          usuario_id: usuarioId,
        }),
      })

      if (res.ok) {
        toast.success("Obrigado pela sua sugestão!")
        setMensagem("")
        setSent(true)
        setTimeout(() => setSent(false), 3000)
      } else {
        toast.error("Erro ao enviar sugestão")
      }
    } catch {
      toast.error("Erro ao enviar")
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Deixe sua sugestão, crítica ou elogio..."
        rows={3}
        className="resize-none bg-background/50 border-border/50"
        maxLength={500}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {mensagem.length}/500 caracteres
        </span>
        <Button
          type="submit"
          size="sm"
          disabled={sending || !mensagem.trim()}
          className="gap-1.5"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : sent ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Enviado!
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
