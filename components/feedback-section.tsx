"use client"

import { useState } from "react"
import { MessageSquare, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function FeedbackSection() {
  const [mensagem, setMensagem] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mensagem.trim()) return

    setEnviando(true)
    try {
      const usuarioId = localStorage.getItem("sgc_usuario_id") || crypto.randomUUID()
      localStorage.setItem("sgc_usuario_id", usuarioId)

      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem, usuario_id: usuarioId }),
      })

      if (res.ok) {
        setMensagem("")
        setEnviado(true)
        setTimeout(() => setEnviado(false), 5000)
      }
    } catch {
      // Silently fail
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="border-t border-border bg-secondary/30 py-12">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Deixe sua Sugestao</h2>
              <p className="text-sm text-muted-foreground">
                Ajude-nos a melhorar! Sua opiniao e muito importante.
              </p>
            </div>
          </div>

          {enviado ? (
            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>Obrigado pela sua sugestao! Vamos analisar em breve.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Escreva sua sugestao, critica ou elogio..."
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {mensagem.length}/500 caracteres
                </span>
                <Button type="submit" disabled={enviando || !mensagem.trim()} className="gap-2">
                  {enviando ? "Enviando..." : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Sugestao
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
