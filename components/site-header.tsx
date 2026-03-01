"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, Search, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/#categorias", label: "Categorias" },
  { href: "/#produtos", label: "Produtos" },
  { href: "/cupons", label: "Cupons" },
]

export function SiteHeader() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image
            src="/logo.png"
            alt="SGC - Seu Guia de Compras"
            width={40}
            height={40}
            priority
          />
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold leading-tight tracking-tight text-foreground">SGC</span>
            <span className="hidden text-[10px] leading-none text-muted-foreground sm:block">Seu Guia de Compras</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 text-muted-foreground md:flex"
            aria-label="Buscar"
            asChild
          >
            <Link href="/busca">
              <Search className="h-4 w-4" />
            </Link>
          </Button>

          <Button asChild className="hidden md:inline-flex" size="sm">
            <Link href="/#produtos">Ver Ofertas</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu de navegacao</SheetTitle>
              <div className="flex flex-col gap-6 pt-8">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <Button asChild className="w-full">
                  <Link href="/#produtos" onClick={() => setOpen(false)}>Ver Ofertas</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
