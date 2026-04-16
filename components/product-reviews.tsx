"use client"

import { useState } from "react"
import { Star, ThumbsUp, ThumbsDown, MessageSquare, CheckCircle, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ProductWithRelations, Review } from "@/lib/db"

interface ProductReviewsProps {
  product: ProductWithRelations
  reviews: Review[] // Reviews vinculados ao productId interno
  supabaseProductId?: string // ID do produto no Supabase para envio de avaliações
}

function RatingBreakdown({ reviews, totalReviews }: { reviews: Review[]; totalReviews: number }) {
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: totalReviews > 0
      ? (reviews.filter(r => r.rating === rating).length / totalReviews) * 100
      : 0,
  }))

  return (
    <div className="flex flex-col gap-2">
      {ratingCounts.map(({ rating, count, percentage }) => (
        <div key={rating} className="flex items-center gap-3">
          <span className="w-8 text-right text-sm text-muted-foreground">{rating}</span>
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <Progress value={percentage} className="h-2 flex-1" />
          <span className="w-8 text-sm text-muted-foreground">{count}</span>
        </div>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {review.authorName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{review.authorName}</p>
                {review.isVerified && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <CheckCircle className="h-3 w-3" />
                    Compra verificada
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <h4 className="mt-3 text-sm font-semibold text-foreground">{review.title}</h4>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{review.content}</p>

      {/* Prós e contras da review */}
      {(review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0) ? (
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          {review.pros && review.pros.length > 0 && (
            <div className="flex items-start gap-1">
              <ThumbsUp className="mt-0.5 h-3 w-3 text-green-600" />
              <span className="text-muted-foreground">{review.pros.join(", ")}</span>
            </div>
          )}
          {review.cons && review.cons.length > 0 && (
            <div className="flex items-start gap-1">
              <ThumbsDown className="mt-0.5 h-3 w-3 text-red-500" />
              <span className="text-muted-foreground">{review.cons.join(", ")}</span>
            </div>
          )}
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-4">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <ThumbsUp className="h-3 w-3" />
          {review.helpfulCount} pessoas acharam útil
        </span>
        {review.notHelpfulCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ThumbsDown className="h-3 w-3" />
            {review.notHelpfulCount}
          </span>
        )}
      </div>
    </div>
  )
}

export function ProductReviews({ product, reviews, supabaseProductId }: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    nome_usuario: "",
    email_usuario: "",
    nota: 5,
    comentario: "",
  })

  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : product.rating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabaseProductId) return
    setSubmitting(true)

    try {
      const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produto_id: supabaseProductId,
          ...form,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setShowForm(false)
        setForm({ nome_usuario: "", email_usuario: "", nota: 5, comentario: "" })
      } else {
        const error = await res.json()
        alert("Erro: " + error.error)
      }
    } catch {
      alert("Erro ao enviar avaliacao")
    } finally {
      setSubmitting(false)
    }
  }

  const renderInteractiveStars = (nota: number, onChange: (n: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="cursor-pointer">
          <Star className={`h-6 w-6 ${n <= nota ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  )

  return (
    <section className="mt-12 lg:mt-16">
      <Separator className="mb-8" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground md:text-2xl">
            Avaliacoes
          </h2>
          <Badge variant="secondary">{product.reviewCount}</Badge>
        </div>
        {supabaseProductId && !showForm && !submitted && (
          <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
            Avaliar Produto
          </Button>
        )}
      </div>

      {/* Mensagem de sucesso */}
      {submitted && (
        <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-700">
          Obrigado pela sua avaliacao! Ela sera publicada apos moderacao.
        </div>
      )}

      {/* Formulario de avaliacao */}
      {showForm && supabaseProductId && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-border bg-card p-6">
          <h4 className="font-semibold">Deixe sua avaliacao</h4>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Sua nota</label>
            {renderInteractiveStars(form.nota, (n) => setForm({ ...form, nota: n }))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Seu nome *</label>
              <Input
                value={form.nome_usuario}
                onChange={(e) => setForm({ ...form, nome_usuario: e.target.value })}
                placeholder="Joao Silva"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Seu email (opcional)</label>
              <Input
                type="email"
                value={form.email_usuario}
                onChange={(e) => setForm({ ...form, email_usuario: e.target.value })}
                placeholder="joao@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Comentario (opcional)</label>
            <Textarea
              value={form.comentario}
              onChange={(e) => setForm({ ...form, comentario: e.target.value })}
              placeholder="Conte sua experiencia com o produto..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting} className="gap-2">
              <Send className="h-4 w-4" />
              {submitting ? "Enviando..." : "Enviar Avaliacao"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Rating Summary */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
            <div className="mt-2 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(avgRating) ? "fill-primary text-primary" : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Baseado em {product.reviewCount} avaliacoes
            </p>
          </div>

          <Separator className="my-4" />

          <RatingBreakdown reviews={reviews} totalReviews={reviews.length} />
        </div>

        {/* Review List */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
              <Star className="mb-3 h-10 w-10 text-primary/40" />
              <p className="text-sm font-medium text-foreground">Seja o primeiro a avaliar este produto!</p>
              <p className="mt-1 text-xs text-muted-foreground">Sua opiniao ajuda outros compradores a tomar decisoes.</p>
              {supabaseProductId && !showForm && !submitted && (
                <Button onClick={() => setShowForm(true)} variant="outline" size="sm" className="mt-4">
                  Deixar Avaliacao
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
