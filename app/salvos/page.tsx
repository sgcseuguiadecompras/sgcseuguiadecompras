import type { Metadata } from "next"
import { SalvosClient } from "@/components/salvos-client"

export const metadata: Metadata = {
  title: "Produtos Salvos",
  description: "Seus produtos salvos para comprar depois",
}

export default function SalvosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      <div className="mb-8 text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Produtos Salvos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Seus produtos favoritos para comprar depois
        </p>
      </div>

      <SalvosClient />
    </div>
  )
}
