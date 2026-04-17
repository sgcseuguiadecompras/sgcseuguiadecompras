"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Eye, ArrowLeft, User, Share2, BookOpen } from "lucide-react"

interface Post {
  id: string
  titulo: string
  slug: string
  resumo: string | null
  conteudo: string
  imagem_capa: string | null
  autor: string
  categoria: string
  tags: string[] | null
  views: number
  created_at: string
}

export default function PostPage() {
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${params.slug}`)
        if (res.status === 404) {
          setNotFoundState(true)
          return
        }
        const data = await res.json()
        if (data.error) {
          setNotFoundState(true)
          return
        }
        setPost(data)
      } catch {
        setNotFoundState(true)
      } finally {
        setLoading(false)
      }
    }
    if (params.slug) {
      fetchPost()
    }
  }, [params.slug])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.titulo,
        text: post?.resumo || "",
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copiado!")
    }
  }

  if (notFoundState) {
    return notFound()
  }

  if (loading) {
    return (
      <div 
        className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-12"
        style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
      >
        <div className="animate-pulse">
          <div className="h-8 w-32 rounded bg-muted" />
          <div className="mt-8 h-10 rounded bg-muted" />
          <div className="mt-4 h-6 w-1/2 rounded bg-muted" />
          <div className="mt-8 aspect-video rounded-xl bg-muted" />
          <div className="mt-8 space-y-4">
            <div className="h-4 rounded bg-muted" />
            <div className="h-4 rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!post) return null

  // Processar conteudo: se nao contem tags HTML, converter quebras de linha em <br> e paragrafos
  const processContent = (content: string) => {
    // Verifica se ja contem tags HTML
    const hasHtmlTags = /<[^>]+>/.test(content)
    if (hasHtmlTags) {
      return content
    }
    // Converte quebras de linha duplas em paragrafos e simples em <br>
    return content
      .split(/\n\n+/)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('')
  }

  const formattedContent = processContent(post.conteudo)

  return (
    <div 
      className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-12"
      style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
    >
      <article>
        {/* Voltar */}
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Blog
          </Button>
        </Link>

        {/* Cabecalho */}
        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{post.categoria}</Badge>
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            {post.titulo}
          </h1>

          {post.resumo && (
            <p className="mt-4 text-lg text-muted-foreground">
              {post.resumo}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-t py-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {post.autor}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.created_at).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.views} visualizacoes
            </div>
            <Button variant="ghost" size="sm" className="ml-auto gap-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </header>

        {/* Imagem de Capa */}
        {post.imagem_capa && (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-xl">
            <Image
              src={post.imagem_capa}
              alt={post.titulo}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Conteudo */}
        <div
          className="prose prose-lg mt-8 max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl"
          style={{ whiteSpace: 'pre-wrap' }}
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />

        {/* Rodape do Post */}
        <footer className="mt-12 rounded-xl bg-muted/50 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Gostou deste guia?</p>
              <p className="text-sm text-muted-foreground">
                Compartilhe com seus amigos e ajude mais pessoas a economizar!
              </p>
            </div>
            <Button className="gap-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </footer>
      </article>
    </div>
  )
}
