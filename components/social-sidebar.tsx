"use client"

import { useEffect, useState } from "react"
import { Instagram, Facebook, Youtube, Twitter, MessageCircle } from "lucide-react"

interface RedeSocial {
  id: string
  nome: string
  url: string
  icone: string
  posicao: string
}

// Mapeamento de ícones
const iconMap: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  x: <Twitter className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
  telegram: <MessageCircle className="h-5 w-5" />,
  tiktok: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ),
}

export function SocialSidebar() {
  const [redes, setRedes] = useState<RedeSocial[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    fetch("/api/redes-sociais?posicao=lateral")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRedes(data)
        }
      })
      .catch(() => {})

    // Mostrar barra após scroll
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (redes.length === 0) return null

  return (
    <div
      className={`fixed left-4 top-1/2 z-40 -translate-y-1/2 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"
      }`}
    >
      <div className="flex flex-col gap-2 rounded-full bg-card/90 p-2 shadow-lg backdrop-blur-sm border border-border">
        {redes.map((rede) => {
          const iconKey = rede.icone?.toLowerCase() || rede.nome?.toLowerCase() || ""
          const icon = iconMap[iconKey] || <MessageCircle className="h-5 w-5" />

          return (
            <a
              key={rede.id}
              href={rede.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              title={rede.nome}
            >
              {icon}
            </a>
          )
        })}
      </div>
    </div>
  )
}
