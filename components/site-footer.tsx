import Link from "next/link"
import Image from "next/image"
import { StatsFooter } from "@/components/stats-footer"
import { FeedbackForm } from "@/components/feedback-form"

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/seuguiadecomprasbr/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@seu.guia.de.compras.br",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/SgcCompras",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

const footerLinks = {
  navegacao: [
    { href: "/", label: "Início" },
    { href: "/#produtos", label: "Produtos" },
    { href: "/cupons", label: "Cupons" },
    { href: "/blog", label: "Blog" },
    { href: "/#categorias", label: "Categorias" },
  ],
  lojas: [
    { href: "#", label: "Amazon" },
    { href: "#", label: "Shopee" },
    { href: "#", label: "Mercado Livre" },
  ],
  suporte: [
    { href: "#", label: "Sobre nós" },
    { href: "#", label: "Contato" },
    { href: "#", label: "Política de Privacidade" },
    { href: "#", label: "Termos de Uso" },
  ],
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <StatsFooter />
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="SGC - Seu Guia de Compras"
                width={40}
                height={40}
              />
              <div className="flex flex-col">
                <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-foreground">SGC</span>
                <span className="text-[10px] leading-none text-muted-foreground">Seu Guia de Compras</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Seu guia inteligente de compras online. Encontre as melhores ofertas, cupons e avaliações verificadas.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Navegação</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.navegacao.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stores */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Lojas Parceiras</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.lojas.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Feedback */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Deixe sua Sugestão</h3>
            <FeedbackForm />
          </div>
        </div>

        {/* Affiliate Disclaimer */}
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Aviso:</strong> Este site contém links de afiliados. Ao clicar e realizar uma compra, podemos receber uma comissão sem custo adicional para você. 
            Todas as avaliações e recomendações são baseadas em análises reais e independentes. Os preços podem variar.
          </p>

          {/* Social Media Icons */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Siga-nos:</span>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Siga-nos no ${social.name}`}
                  className="text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SGC - Seu Guia de Compras. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
