import Link from "next/link"
import Image from "next/image"

const footerLinks = {
  navegacao: [
    { href: "/", label: "Início" },
    { href: "/#produtos", label: "Produtos" },
    { href: "/cupons", label: "Cupons" },
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

          {/* Support */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Suporte</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.suporte.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Affiliate Disclaimer */}
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Aviso:</strong> Este site contém links de afiliados. Ao clicar e realizar uma compra, podemos receber uma comissão sem custo adicional para você. 
            Todas as avaliações e recomendações são baseadas em análises reais e independentes. Os preços podem variar.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SGC - Seu Guia de Compras. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
