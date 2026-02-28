import type { Metadata } from "next"
import { CouponsClient } from "@/components/coupons-client"
import { couponRepository, storeRepository } from "@/lib/db"

export const metadata: Metadata = {
  title: "Cupons de Desconto Atualizados - Shopee, Amazon, Mercado Livre",
  description: "Encontre os melhores cupons de desconto verificados e atualizados diariamente para Shopee, Amazon, Mercado Livre e mais. Economize em suas compras online.",
  alternates: {
    canonical: "/cupons",
  },
}

export default async function CuponsPage() {
  const coupons = await couponRepository.getActiveCoupons()
  const stores = await storeRepository.getActiveStores()
  const storeNames = stores.map(s => s.name)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Cupons de Desconto
        </h1>
        <p className="mt-2 text-muted-foreground">
          Cupons verificados e atualizados diariamente
        </p>
      </div>

      <CouponsClient coupons={coupons} stores={storeNames} />
    </div>
  )
}
